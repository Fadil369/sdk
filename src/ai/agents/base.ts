/**
 * Base AI agent class and interfaces
 */

import { Logger } from '@/core/logger';
import { AIAgent, AIWorkflow, WorkflowStep } from '@/types/ai';

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  patientId?: string;
  organizationId?: string;
  language?: 'ar' | 'en';
  metadata?: Record<string, unknown>;
}

export interface AgentTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, unknown>;
  context: AgentContext;
  createdAt: string;
  dueAt?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: Record<string, unknown>;
  error?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  requiredPermissions?: string[];
}

export abstract class BaseAgent {
  protected logger: Logger;
  protected agent: AIAgent;
  protected capabilities: Map<string, AgentCapability> = new Map();
  protected tasks: Map<string, AgentTask> = new Map();

  constructor(agent: AIAgent, logger: Logger) {
    this.agent = agent;
    this.logger = logger.child({ component: `Agent-${agent.name}`, agentId: agent.id });
    this.initializeCapabilities();
  }

  /**
   * Initialize agent capabilities (to be implemented by subclasses)
   */
  protected abstract initializeCapabilities(): void;

  /**
   * Process a task (to be implemented by subclasses)
   */
  protected abstract processTask(task: AgentTask): Promise<Record<string, unknown>>;

  /**
   * Get agent information
   */
  getAgentInfo(): AIAgent {
    return { ...this.agent };
  }

  /**
   * Get agent capabilities
   */
  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(capabilityName: string): boolean {
    return this.capabilities.has(capabilityName);
  }

  /**
   * Create a new task
   */
  async createTask(
    type: string,
    data: Record<string, unknown>,
    context: AgentContext,
    priority: AgentTask['priority'] = 'medium',
    dueAt?: string
  ): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const task: AgentTask = {
      id: taskId,
      type,
      priority,
      data,
      context,
      createdAt: new Date().toISOString(),
      dueAt,
      status: 'pending',
    };

    this.tasks.set(taskId, task);

    this.logger.info('Task created', {
      taskId,
      type,
      priority,
      userId: context.userId,
      patientId: context.patientId,
    });

    // Auto-process task if agent is available
    if (this.agent.status === 'active') {
      setImmediate(() => this.executeTask(taskId));
    }

    return taskId;
  }

  /**
   * Execute a task
   */
  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      this.logger.error('Task not found', new Error(`Task ${taskId} not found`));
      return;
    }

    if (task.status !== 'pending') {
      this.logger.warn('Task is not in pending status', { taskId, status: task.status });
      return;
    }

    // Update task status
    task.status = 'processing';
    this.tasks.set(taskId, task);

    this.logger.info('Task execution started', {
      taskId,
      type: task.type,
      priority: task.priority,
    });

    try {
      // Check if agent can handle this task type
      if (!this.hasCapability(task.type)) {
        throw new Error(`Agent does not have capability: ${task.type}`);
      }

      // Process the task
      const result = await this.processTask(task);

      // Update task with result
      task.status = 'completed';
      task.result = result;
      this.tasks.set(taskId, task);

      this.logger.info('Task execution completed', {
        taskId,
        type: task.type,
        executionTime: Date.now() - new Date(task.createdAt).getTime(),
      });
    } catch (error) {
      // Update task with error
      task.status = 'failed';
      task.error = (error as Error).message;
      this.tasks.set(taskId, task);

      this.logger.error('Task execution failed', error as Error, {
        taskId,
        type: task.type,
      });
    }
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | null {
    return this.tasks.get(taskId) || null;
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: AgentTask['status']): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  /**
   * Get all tasks for a user
   */
  getUserTasks(userId: string): AgentTask[] {
    return Array.from(this.tasks.values()).filter(task => task.context.userId === userId);
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'completed' || task.status === 'failed') {
      return false; // Cannot cancel completed or failed tasks
    }

    task.status = 'cancelled';
    this.tasks.set(taskId, task);

    this.logger.info('Task cancelled', { taskId, type: task.type });
    return true;
  }

  /**
   * Get agent statistics
   */
  getStats(): {
    totalTasks: number;
    pendingTasks: number;
    processingTasks: number;
    completedTasks: number;
    failedTasks: number;
    cancelledTasks: number;
    averageExecutionTime: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const stats = {
      totalTasks: tasks.length,
      pendingTasks: 0,
      processingTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      cancelledTasks: 0,
      averageExecutionTime: 0,
    };

    let totalExecutionTime = 0;
    let completedCount = 0;

    for (const task of tasks) {
      switch (task.status) {
        case 'pending':
          stats.pendingTasks++;
          break;
        case 'processing':
          stats.processingTasks++;
          break;
        case 'completed':
          stats.completedTasks++;
          completedCount++;
          if (task.result) {
            const createdAt = new Date(task.createdAt).getTime();
            const executionTime = Date.now() - createdAt;
            totalExecutionTime += executionTime;
          }
          break;
        case 'failed':
          stats.failedTasks++;
          break;
        case 'cancelled':
          stats.cancelledTasks++;
          break;
      }
    }

    stats.averageExecutionTime =
      completedCount > 0 ? Math.round(totalExecutionTime / completedCount) : 0;

    return stats;
  }

  /**
   * Update agent status
   */
  setStatus(status: AIAgent['status']): void {
    this.agent.status = status;
    this.logger.info('Agent status updated', { status });
  }

  /**
   * Update agent configuration
   */
  updateConfiguration(config: Record<string, unknown>): void {
    this.agent.configuration = { ...this.agent.configuration, ...config };
    this.logger.info('Agent configuration updated', { keys: Object.keys(config) });
  }

  /**
   * Cleanup old completed tasks
   */
  async cleanupTasks(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = Date.now() - maxAge;
    let cleanedCount = 0;

    for (const [taskId, task] of this.tasks.entries()) {
      const taskTime = new Date(task.createdAt).getTime();
      if (
        taskTime < cutoffTime &&
        (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled')
      ) {
        this.tasks.delete(taskId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('Old tasks cleaned up', { cleanedCount });
    }

    return cleanedCount;
  }

  /**
   * Shutdown agent
   */
  async shutdown(): Promise<void> {
    // Cancel all pending tasks
    const pendingTasks = this.getTasksByStatus('pending');
    for (const task of pendingTasks) {
      await this.cancelTask(task.id);
    }

    this.setStatus('inactive');
    this.logger.info('Agent shutdown complete');
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    agentStatus: AIAgent['status'];
    pendingTasks: number;
    lastActivity?: string;
  }> {
    const stats = this.getStats();
    const tasks = Array.from(this.tasks.values());
    const lastActivity =
      tasks.length > 0
        ? tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt
        : undefined;

    return {
      status: this.agent.status === 'active' && stats.failedTasks === 0 ? 'healthy' : 'degraded',
      agentStatus: this.agent.status,
      pendingTasks: stats.pendingTasks,
      lastActivity,
    };
  }
}

/**
 * Factory function to create agent capability
 */
export function createAgentCapability(
  name: string,
  description: string,
  inputSchema: Record<string, unknown>,
  outputSchema: Record<string, unknown>,
  requiredPermissions?: string[]
): AgentCapability {
  return {
    name,
    description,
    inputSchema,
    outputSchema,
    requiredPermissions,
  };
}
