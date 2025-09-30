/**
 * Base AI agent class and interfaces
 */

import { Logger } from '@/core/logger';
import { AIAgent } from '@/types/ai';

export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'validation' | 'transformation' | 'analysis' | 'decision' | 'action';
  config: Record<string, unknown>;
  dependencies?: string[];
  timeout?: number;
}

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
    successRate: number;
    performanceMetrics: {
      tasksPerHour: number;
      errorRate: number;
      averageResponseTime: number;
    };
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
      successRate: 0,
      performanceMetrics: {
        tasksPerHour: 0,
        errorRate: 0,
        averageResponseTime: 0,
      },
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

    if (completedCount > 0) {
      stats.averageExecutionTime = totalExecutionTime / completedCount;
    }

    // Calculate success rate
    const finishedTasks = stats.completedTasks + stats.failedTasks;
    if (finishedTasks > 0) {
      stats.successRate = (stats.completedTasks / finishedTasks) * 100;
    }

    // Calculate performance metrics
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const recentTasks = tasks.filter(t => new Date(t.createdAt).getTime() > oneHourAgo);
    stats.performanceMetrics.tasksPerHour = recentTasks.length;

    const recentFinishedTasks = recentTasks.filter(
      t => t.status === 'completed' || t.status === 'failed'
    );
    if (recentFinishedTasks.length > 0) {
      stats.performanceMetrics.errorRate =
        (recentTasks.filter(t => t.status === 'failed').length / recentFinishedTasks.length) * 100;
      stats.performanceMetrics.averageResponseTime =
        recentFinishedTasks.reduce((sum, task) => {
          return sum + (now - new Date(task.createdAt).getTime());
        }, 0) / recentFinishedTasks.length;
    }

    return stats;
  }

  /**
   * Enhanced workflow execution with creative capabilities
   */
  async executeWorkflow(
    workflow: AIWorkflow,
    context: AgentContext
  ): Promise<{
    success: boolean;
    results: Record<string, unknown>;
    executionTime: number;
    stepsCompleted: number;
    errors?: string[];
  }> {
    const startTime = Date.now();
    const results: Record<string, unknown> = {};
    const errors: string[] = [];
    let stepsCompleted = 0;

    this.logger.info('Workflow execution started', {
      workflowId: workflow.id,
      workflowName: workflow.name,
      totalSteps: workflow.steps.length,
    });

    try {
      // Sort steps by dependencies
      const sortedSteps = this.topologicalSort(workflow.steps);

      for (const step of sortedSteps) {
        try {
          const stepStartTime = Date.now();

          // Check if step dependencies are satisfied
          if (step.dependencies) {
            for (const depId of step.dependencies) {
              if (!results[depId]) {
                throw new Error(`Step dependency ${depId} not satisfied`);
              }
            }
          }

          // Execute step with timeout
          const stepResult = await this.executeWorkflowStep(step, context, results);
          results[step.id] = stepResult;
          stepsCompleted++;

          const stepExecutionTime = Date.now() - stepStartTime;
          this.logger.debug('Workflow step completed', {
            workflowId: workflow.id,
            stepId: step.id,
            stepName: step.name,
            executionTime: stepExecutionTime,
          });
        } catch (error) {
          const errorMsg = `Step ${step.name} failed: ${(error as Error).message}`;
          errors.push(errorMsg);
          this.logger.error('Workflow step failed', error as Error, {
            workflowId: workflow.id,
            stepId: step.id,
            stepName: step.name,
          });

          // Continue with non-critical steps or stop based on step configuration
          if (step.type === 'validation') {
            break; // Stop on validation failures
          }
        }
      }

      const executionTime = Date.now() - startTime;
      const success = errors.length === 0;

      this.logger.info('Workflow execution completed', {
        workflowId: workflow.id,
        success,
        stepsCompleted,
        totalSteps: workflow.steps.length,
        executionTime,
        errorCount: errors.length,
      });

      return {
        success,
        results,
        executionTime,
        stepsCompleted,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('Workflow execution failed', error as Error, {
        workflowId: workflow.id,
        stepsCompleted,
        executionTime,
      });

      return {
        success: false,
        results,
        executionTime,
        stepsCompleted,
        errors: [`Workflow execution failed: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown> {
    // Implementation would depend on step type
    switch (step.type) {
      case 'validation':
        return this.executeValidationStep(step, context, previousResults);
      case 'transformation':
        return this.executeTransformationStep(step, context, previousResults);
      case 'analysis':
        return this.executeAnalysisStep(step, context, previousResults);
      case 'decision':
        return this.executeDecisionStep(step, context, previousResults);
      case 'action':
        return this.executeActionStep(step, context, previousResults);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Topological sort for workflow steps
   */
  private topologicalSort(steps: WorkflowStep[]): WorkflowStep[] {
    const visited = new Set<string>();
    const sorted: WorkflowStep[] = [];
    const stepMap = new Map(steps.map(step => [step.id, step]));

    const visit = (step: WorkflowStep): void => {
      if (visited.has(step.id)) {
        return;
      }

      visited.add(step.id);

      // Visit dependencies first
      if (step.dependencies) {
        for (const depId of step.dependencies) {
          const depStep = stepMap.get(depId);
          if (depStep) {
            visit(depStep);
          }
        }
      }

      sorted.push(step);
    };

    for (const step of steps) {
      visit(step);
    }

    return sorted;
  }

  // Abstract methods for workflow step execution
  protected abstract executeValidationStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown>;
  protected abstract executeTransformationStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown>;
  protected abstract executeAnalysisStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown>;
  protected abstract executeDecisionStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown>;
  protected abstract executeActionStep(
    step: WorkflowStep,
    context: AgentContext,
    previousResults: Record<string, unknown>
  ): Promise<unknown>;

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
