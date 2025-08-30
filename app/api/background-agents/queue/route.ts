import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { db } from '@/lib/db';
import { backgroundAgentsTable, integrationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { after } from 'next/server';
import { GithubMetadata } from '@/types/integrations/github';
import { Sandbox } from '@e2b/code-interpreter'
import { createE2BProvider } from '@vibe-kit/e2b';
import { VibeKit } from '@vibe-kit/sdk';
import { script } from './script';
import { getBotToken } from '@/lib/github/api';
import { codexConfig } from './script';


type Payload = {
  id: string;
};

async function handler(req: Request) {
  const { id } = (await req.json()) as Payload;

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const [agent] = await db
    .select()
    .from(backgroundAgentsTable)
    .where(eq(backgroundAgentsTable.id, id))
    .limit(1);

  if (!agent) {
    return new Response('Not found', { status: 404 });
  }

  const [integration] = await db.select().from(integrationsTable).where(eq(integrationsTable.id, agent.integrationId));
  const metadata = integration?.metadata as GithubMetadata;

  const botToken = await getBotToken(metadata.installationId);

  const openRouterKey = process.env.OPENROUTER_API_KEY!;

  const agentType = 'codex';
  const model = 'openai/gpt-5-mini';
  const provider = 'openrouter';

  await db.update(backgroundAgentsTable).set({
    status: 'in_progress',
  }).where(eq(backgroundAgentsTable.id, id));

  after(async () => {
    try {
      const e2bProvider = createE2BProvider({
        apiKey: process.env.E2B_API_KEY!,
        templateId: '3ccbgi9t5jhzrk63a8d9', // TODO: replace with your template id
      });

      const vibeKit = new VibeKit()
        .withAgent({
          type: agentType,
          provider: provider,
          apiKey: openRouterKey,
          model: model,
        })
        .withSecrets({
          GITHUB_TOKEN: botToken,
          GITHUB_REPO: agent.repositoryFullName!,
          PROMPT: agent.prompt!,
          AGENT_TYPE: agentType,
          MODEL: model,
          PROVIDER: provider,
          E2B_API_KEY: process.env.E2B_API_KEY!,
          AI_API_KEY: openRouterKey,
          OPENROUTER_API_KEY: openRouterKey,
        })
        .withSandbox(e2bProvider)
        .withGithub({
          token: botToken,
          repository: agent.repositoryFullName,
        });

      vibeKit.on("update", (update) => {
        console.log("Update:", update);
      });

      vibeKit.on("error", (error) => {
        console.error("Error:", error);
      });

      await vibeKit.executeCommand("ls -la");

      const session = await vibeKit.getSession();

      if (!session) {
        await db.update(backgroundAgentsTable).set({
          status: 'failed',
          prUrl: null,
        }).where(eq(backgroundAgentsTable.id, id));

        return
      }

      await db.update(backgroundAgentsTable).set({
        status: 'in_progress',
        sandboxId: session,
      }).where(eq(backgroundAgentsTable.id, id));

      const sbx = await Sandbox.connect(session);
      await sbx.files.write('/shipvibes/run.js', script);

      await sbx.files.write('/home/user/.codex/config.toml', codexConfig);

      let bashrc = await sbx.files.read('/home/user/.bashrc');
      bashrc = bashrc + `
      codex() { command codex --profile openrouter_small "$@"; }
      codex_large() { command codex --profile openrouter "$@"; }
      codex_small() { command codex --profile openrouter_small "$@"; }
      `

      await sbx.files.write('/home/user/.bashrc', bashrc);

      await vibeKit.generateCode({
        prompt: "do nothing",
      });

      const execution = await sbx.commands.run('node /shipvibes/run.js', {
        background: true,
        envs: {
          AGENT_ID: sbx.sandboxId,
        },
        timeoutMs: 1000 * 60 * 60, // 1 hour
      })

    } catch (error) {
      console.error("Error:", error);
      await db.update(backgroundAgentsTable).set({
        status: 'failed',
      }).where(eq(backgroundAgentsTable.id, id));
    }
  });

  return Response.json({ ok: true });
}

export const POST = verifySignatureAppRouter(handler);


