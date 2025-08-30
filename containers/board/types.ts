export type AgentModel =
  | 'auto'
  | 'gpt-5-codex'
  | 'claude-sonnet-4-claude-cli'
  | 'claude-opus-4.1-claude-cli';

export type MachinePlan = '2c-2g' | '4c-4g' | '8c-8g' | '8c-16g' | '16c-32g' | '16c-64g';

export const MODEL_OPTIONS: Array<{ label: string; value: AgentModel }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'GPT-5 with Codex', value: 'gpt-5-codex' },
  { label: 'Claude Sonnet 4 with Claude CLI', value: 'claude-sonnet-4-claude-cli' },
  { label: 'Claude Opus 4.1 with Claude CLI', value: 'claude-opus-4.1-claude-cli' },
];

export const MACHINE_OPTIONS: Array<{ label: string; value: MachinePlan }> = [
  { label: '2 cores, 2 GiB RAM', value: '2c-2g' },
  { label: '4 cores, 4 GiB RAM', value: '4c-4g' },
  { label: '8 cores, 8 GiB RAM', value: '8c-8g' },
  { label: '8 cores, 16 GiB RAM', value: '8c-16g' },
  { label: '16 cores, 32 GiB RAM', value: '16c-32g' },
  { label: '16 cores, 64 GiB RAM', value: '16c-64g' },
];

