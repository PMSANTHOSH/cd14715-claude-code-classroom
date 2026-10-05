import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/index.js';

export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies refactoring opportunities, architectural improvements, code duplication, unnecessary complexity, and modernization opportunities.',
  prompt: REFACTORING_SUGGESTER_PROMPT,
  model: 'inherit',
  tools: ['Read', 'Grep', 'Glob', 'Skill'],
  mcpServers: ['github', 'eslint']
};
