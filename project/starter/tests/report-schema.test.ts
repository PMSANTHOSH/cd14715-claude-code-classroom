import { describe, expect, it } from 'vitest';
import {
  ReviewReportSchema,
  ReviewReportJSONSchema
} from '../src/types/report-types.js';

describe('ReviewReport schema', () => {
  it('should accept a valid empty review report', () => {
    const report = {
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

    const result = ReviewReportSchema.safeParse(report);

    expect(result.success).toBe(true);
  });

  it('should reject a report with an invalid pull request number', () => {
    const report = {
      pullRequest: {
        owner: 'octocat',
        repo: 'Hello-World',
        number: 'invalid'
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
        agentVersions: {}
      }
    };

    const result = ReviewReportSchema.safeParse(report);

    expect(result.success).toBe(false);
  });

  it('should expose a JSON schema for structured output', () => {
    expect(ReviewReportJSONSchema).toBeDefined();
    expect(typeof ReviewReportJSONSchema).toBe('object');
  });
});
