import { query } from '@anthropic-ai/claude-agent-sdk';
import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

import { mcpServersConfig } from './config/mcp.config.js';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
} from './agents/index.js';
import { buildOrchestratorPrompt } from './prompts/index.js';
import {
  ReviewReportSchema,
  ReviewReportJSONSchema,
  type ReviewReport
} from './types/report-types.js';

/**
 * Orchestrator configuration options
 */
export interface OrchestratorOptions {
  model?: string;
  cwd?: string;
  maxTurns?: number;
  maxBudgetUsd?: number;
}

/**
 * Main Code Review Orchestrator
 * Coordinates subagents to analyze pull requests and generate comprehensive reports
 */
export class CodeReviewOrchestrator {
  private readonly model: string;
  private readonly cwd: string;
  private readonly maxTurns: number;
  private readonly maxBudgetUsd?: number;

  constructor(options: OrchestratorOptions = {}) {
    this.model =
      options.model ||
      process.env.ANTHROPIC_MODEL ||
      'claude-sonnet-4-5-20250929';

    this.cwd =
      options.cwd ||
      process.env.PROJECT_ROOT ||
      process.cwd();

    this.maxTurns = options.maxTurns ?? 30;
    this.maxBudgetUsd = options.maxBudgetUsd;
  }

  /**
   * Review a pull request using parallel subagent analysis
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param prNumber - Pull request number
   * @returns Complete review report
   */
  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    if (!owner || !repo) {
      throw new Error('Repository owner and name are required');
    }

    if (!Number.isInteger(prNumber) || prNumber <= 0) {
      throw new Error('Pull request number must be a positive integer');
    }

    const startedAt = Date.now();

    const agents: Record<string, AgentDefinition> = {
      'code-quality-analyzer': codeQualityAnalyzer,
      'test-coverage-analyzer': testCoverageAnalyzer,
      'refactoring-suggester': refactoringSuggester
    };

    const prompt = buildOrchestratorPrompt(owner, repo, prNumber);

    const resultQuery = query({
      prompt,
      options: {
        model: this.model,
        cwd: this.cwd,
        maxTurns: this.maxTurns,
        ...(this.maxBudgetUsd !== undefined
          ? { maxBudgetUsd: this.maxBudgetUsd }
          : {}),
        agents,
        mcpServers: mcpServersConfig,
        allowedTools: [
          'Read',
          'Grep',
          'Glob',
          'Bash',
          'Task'
        ],
        settingSources: ['project'],
        outputFormat: {
          type: 'json_schema',
          schema: ReviewReportJSONSchema
        }
      }
    });

    let structuredOutput: unknown;

    for await (const message of resultQuery) {
      if (
        message.type === 'result' &&
        message.subtype === 'success'
      ) {
        structuredOutput = message.structured_output;

        if (!structuredOutput && message.result) {
          try {
            structuredOutput = JSON.parse(message.result);
          } catch {
            throw new Error(
              'Claude returned a result that could not be parsed as JSON'
            );
          }
        }
      }

      if (
        message.type === 'result' &&
        message.subtype !== 'success'
      ) {
        throw new Error(
          `Claude review failed: ${message.errors.join('; ')}`
        );
      }
    }

    if (!structuredOutput) {
      throw new Error(
        'Claude review completed without producing structured output'
      );
    }

    const validation = ReviewReportSchema.safeParse(structuredOutput);

    if (!validation.success) {
      throw new Error(
        `Review report validation failed: ${validation.error.message}`
      );
    }

    const report = validation.data;

    return {
      ...report,
      pullRequest: {
        owner,
        repo,
        number: prNumber
      },
      metadata: {
        ...report.metadata,
        analyzedAt:
          report.metadata?.analyzedAt ||
          new Date().toISOString(),
        duration: Date.now() - startedAt,
        agentVersions: {
          'code-quality-analyzer': '1.0.0',
          'test-coverage-analyzer': '1.0.0',
          'refactoring-suggester': '1.0.0'
        }
      }
    };
  }
}
