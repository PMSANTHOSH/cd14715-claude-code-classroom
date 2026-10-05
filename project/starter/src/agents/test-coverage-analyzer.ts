import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts/index.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Analyzes pull request code for test coverage gaps, untested execution paths, missing edge cases, and recommended tests.',
  prompt: TEST_COVERAGE_ANALYZER_PROMPT,
  model: 'sonnet',
  mcpServers: ['github']
};
