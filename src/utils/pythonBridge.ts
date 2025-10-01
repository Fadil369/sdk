/**
 * Thin wrapper for invoking the Python bridge that exposes the
 * PyBrain/PyHeart packages to the TypeScript SDK.
 *
 * Note: This module only works in Node.js environments.
 */

import type { PythonBridgeOptions } from '@/types/python';

function checkNodeJsEnvironment(): void {
  if (typeof process === 'undefined' || !process.versions?.node) {
    throw new PythonBridgeError(
      'Python bridge is only available in Node.js environments. ' +
      'Browser environments cannot execute Python code directly.'
    );
  }
}

export class PythonBridgeError extends Error {
  public readonly code?: number;
  public readonly stderr?: string;

  constructor(message: string, options?: { code?: number; stderr?: string }) {
    super(message);
    this.name = 'PythonBridgeError';
    this.code = options?.code;
    this.stderr = options?.stderr;
  }
}

const DEFAULT_TIMEOUT = 15_000;

async function resolveBridgePath(): Promise<string> {
  checkNodeJsEnvironment();
  const { fileURLToPath } = await import('node:url');
  const bridgeUrl = new URL('../../python-integration/bridge.py', import.meta.url);
  return fileURLToPath(bridgeUrl);
}

export async function runPythonBridge<TPayload extends object, TResult = unknown>(
  packageName: 'pybrain' | 'pyheart',
  action: string,
  payload: TPayload,
  options?: PythonBridgeOptions
): Promise<TResult> {
  checkNodeJsEnvironment();
  
  const { spawn } = await import('node:child_process');
  
  const pythonExecutable = options?.pythonPath ?? process.env.PYTHON_BRIDGE_PYTHON ?? 'python3';
  const bridgePath = await resolveBridgePath();
  const args = [bridgePath, '--package', packageName, '--action', action];
  const timeout = options?.timeoutMs ?? DEFAULT_TIMEOUT;

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...(options?.env ?? {}),
  };

  const child = spawn(pythonExecutable, args, {
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (!child.stdin || !child.stdout || !child.stderr) {
    throw new PythonBridgeError('Python bridge did not expose stdio streams');
  }

  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];

  child.stdout.on('data', (chunk: Buffer | string) => {
    stdoutChunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk);
  });

  child.stderr.on('data', (chunk: Buffer | string) => {
    stderrChunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk);
  });

  const timer = setTimeout(() => {
    child.kill('SIGKILL');
  }, timeout);

  const payloadJson = JSON.stringify(payload ?? {});
  child.stdin.write(payloadJson, 'utf8');
  child.stdin.end();

  let exitCode: number;

  try {
    exitCode = await new Promise<number>((resolve, reject) => {
      child.once('error', (error: Error) => reject(error));
      child.once('close', (code: number | null) => {
        resolve(code ?? 1);
      });
    });
  } catch (error) {
    clearTimeout(timer);
    throw new PythonBridgeError(`Failed to execute Python bridge: ${(error as Error).message}`);
  }

  clearTimeout(timer);

  const stdout = Buffer.concat(stdoutChunks).toString('utf8').trim();
  const stderr = Buffer.concat(stderrChunks).toString('utf8').trim();

  if (exitCode !== 0) {
    throw new PythonBridgeError(stderr || `Python bridge exited with code ${exitCode}`, {
      code: exitCode,
      stderr,
    });
  }

  if (!stdout) {
    return {} as TResult;
  }

  try {
    return JSON.parse(stdout) as TResult;
  } catch (error) {
    throw new PythonBridgeError(
      `Failed to parse Python bridge response: ${(error as Error).message}`
    );
  }
}
