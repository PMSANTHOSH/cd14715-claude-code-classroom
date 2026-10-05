import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/index.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes pull request code for bugs, security issues, performance problems, maintainability issues, style violations, and best-practice violations.',
  prompt: CODE_QUALITY_ANALYZER_PROMPT,
  model: 'sonnet',
  mcpServers: ['github', 'eslint']
};
