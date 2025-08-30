export const script = `
import { VibeKit } from '@vibe-kit/sdk';
import { appendFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { createE2BProvider } from '@vibe-kit/e2b';

async function main() {
  const gitToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const prompt = process.env.PROMPT;
  const sandboxID = process.env.AGENT_ID;
  const agentType = process.env.AGENT_TYPE;
  const model = process.env.MODEL;
  const provider = process.env.PROVIDER;
  const aiApiKey = process.env.AI_API_KEY;

  const logFilePath = '/tmp/shipvibes.jsonl';
  const timestamp = new Date().toISOString();

  // Ensure log directory exists and create initial log file
  try {
    // Ensure /tmp directory exists (should exist on most systems, but just in case)
    if (!existsSync('/tmp')) {
      mkdirSync('/tmp', { recursive: true });
    }
    
    // Create the log file if it doesn't exist
    if (!existsSync(logFilePath)) {
      writeFileSync(logFilePath, '', { encoding: 'utf-8' });
    }
  } catch (error) {
    console.error('Error setting up log file:', error);
  }

  // Helper function to append log entry to file
  const appendLog = (type, data) => {
    try {
      const logEntry = {
        timestamp,
        type,
        data,
        sandboxID,
        agentType,
      };
      
      appendFileSync(logFilePath, JSON.stringify(logEntry) + '\\n', {
        encoding: 'utf-8',
        flag: 'a', // Append mode
      });
    } catch (error) {
      console.error('Error writing log entry to file:', error);
    }
  };

  try {
    const e2bProvider = createE2BProvider({
      apiKey: process.env.E2B_API_KEY,
    });

    const vibeKit = new VibeKit()
      .withAgent({
        type: agentType,
        provider: provider,
        apiKey: aiApiKey,
        model: model,
      })
      .withSecrets({
        AI_API_KEY: aiApiKey,
        OPENAI_BASE_URL: 'https://openrouter.ai/api/v1',
        OPENROUTER_API_KEY: aiApiKey,
      })
      .withSandbox(e2bProvider)
      .withGithub({
        token: gitToken,
        repository: repo,
      })
      .withSession(sandboxID);

    vibeKit.on("update", (update) => {
      console.log(update);
      appendLog('log', update);
    });

    vibeKit.on("error", (error) => {
      console.error(error);
      appendLog('error', error);
    });

    await vibeKit.executeCommand(\`source /home/user/.bashrc\`);

    const response = await vibeKit.generateCode({
      prompt: prompt + "DO NOT COMMIT THE CODE, ONLY UPDATE THE FILES.",
      mode: "code",
    });

    const pullRequest = await vibeKit.createPullRequest(null, sandboxID);

    appendLog('pull-request', pullRequest);
  } catch (error) {
    console.error('Error:', error);
    appendLog('fatal', error);
  }

  // Write completion marker
  try {
    appendLog('completion', { status: 'finished', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error writing completion marker:', error);
  }
}

main();

`

export const codexConfig = `
model_provider = "openrouter"

[model_providers.openrouter]
name = "OpenRouter"
base_url = "https://openrouter.ai/api/v1"
env_key = "OPENROUTER_API_KEY"

[profiles.openrouter]
model_provider = "openrouter"
model = "openai/gpt-5-mini"

[profiles.openrouter_small]
model_provider = "openrouter"
model = "openai/gpt-5-mini"
`
