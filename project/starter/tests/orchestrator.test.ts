import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
  query: vi.fn()
}));

import { query } from '@anthropic-ai/claude-agent-sdk';
import { CodeReviewOrchestrator } from '../src/orchestrator.js';

const mockedQuery = vi.mocked(query);

const validReport = {
  pullRequest: {
    owner: 'octocat',
    repo: 'Hello-World',
    number: 1
  },
  fileReviews: [],
  summary: {
    totalFiles: 0,
    overallScore: 90,
    criticalIssues: 0,
    highPriorityTests: 0,
    refactoringOpportunities: 0
  },
  recommendations: [],
  metadata: {
    analyzedAt: new Date().toISOString(),
    duration: 10,
    agentVersions: {
      'code-quality-analyzer': '1.0.0',
      'test-coverage-analyzer': '1.0.0',
      'refactoring-suggester': '1.0.0'
    }
  }
};

async function* successfulQuery() {
  yield {
    type: 'result',
    subtype: 'success',
    structured_output: validReport,
    result: JSON.stringify(validReport)
  };
}

describe('CodeReviewOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should initialize with default options', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      await orchestrator.reviewPullRequest('octocat', 'Hello-World', 1);

      expect(mockedQuery).toHaveBeenCalledTimes(1);

      const call = mockedQuery.mock.calls[0]?.[0];
      expect(call?.options?.model).toBe(
        process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'
      );
      expect(call?.options?.maxTurns).toBe(30);
    });

    it('should accept custom orchestrator options', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator({
        model: 'sonnet',
        cwd: '/tmp/test-project',
        maxTurns: 10,
        maxBudgetUsd: 1
      });

      await orchestrator.reviewPullRequest('octocat', 'Hello-World', 1);

      const call = mockedQuery.mock.calls[0]?.[0];
      expect(call?.options?.model).toBe('sonnet');
      expect(call?.options?.cwd).toBe('/tmp/test-project');
      expect(call?.options?.maxTurns).toBe(10);
      expect(call?.options?.maxBudgetUsd).toBe(1);
    });
  });

  describe('reviewPullRequest', () => {
    it('should configure GitHub and ESLint MCP servers', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      await orchestrator.reviewPullRequest('octocat', 'Hello-World', 1);

      const call = mockedQuery.mock.calls[0]?.[0];
      const mcpServers = call?.options?.mcpServers as Record<string, unknown>;

      expect(mcpServers).toHaveProperty('github');
      expect(mcpServers).toHaveProperty('eslint');
    });

    it('should register all 3 specialized subagents', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      await orchestrator.reviewPullRequest('octocat', 'Hello-World', 1);

      const call = mockedQuery.mock.calls[0]?.[0];
      const agents = call?.options?.agents as Record<string, unknown>;

      expect(agents).toHaveProperty('code-quality-analyzer');
      expect(agents).toHaveProperty('test-coverage-analyzer');
      expect(agents).toHaveProperty('refactoring-suggester');
      expect(Object.keys(agents)).toHaveLength(3);
    });

    it('should include the requested repository and PR in the prompt', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      await orchestrator.reviewPullRequest('octocat', 'Hello-World', 42);

      const call = mockedQuery.mock.calls[0]?.[0];

      expect(call?.prompt).toContain('octocat/Hello-World');
      expect(call?.prompt).toContain('pull request #42');
    });

    it('should aggregate a valid result into ReviewReport', async () => {
      mockedQuery.mockReturnValue(successfulQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      const report = await orchestrator.reviewPullRequest(
        'octocat',
        'Hello-World',
        1
      );

      expect(report.pullRequest).toEqual({
        owner: 'octocat',
        repo: 'Hello-World',
        number: 1
      });
      expect(report.summary.overallScore).toBe(90);
      expect(report.metadata.agentVersions).toHaveProperty(
        'code-quality-analyzer'
      );
    });

    it('should reject invalid repository input', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('', 'Hello-World', 1)
      ).rejects.toThrow('Repository owner and name are required');

      expect(mockedQuery).not.toHaveBeenCalled();
    });

    it('should reject invalid pull request numbers', async () => {
      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('octocat', 'Hello-World', 0)
      ).rejects.toThrow(
        'Pull request number must be a positive integer'
      );

      expect(mockedQuery).not.toHaveBeenCalled();
    });

    it('should reject invalid structured output', async () => {
      async function* invalidQuery() {
        yield {
          type: 'result',
          subtype: 'success',
          structured_output: {
            invalid: true
          },
          result: '{}'
        };
      }

      mockedQuery.mockReturnValue(invalidQuery() as never);

      const orchestrator = new CodeReviewOrchestrator();

      await expect(
        orchestrator.reviewPullRequest('octocat', 'Hello-World', 1)
      ).rejects.toThrow('Review report validation failed');
    });
  });
});
