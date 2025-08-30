import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { backgroundAgentsTable, backgroundAgentLogsTable } from '@/db/schema';
import { Sandbox } from '@e2b/code-interpreter';
import { after } from 'next/server';


type Payload = {
  id: string;
};

type Log = {
  timestamp: string;
  type: 'log' | 'error' | 'pull-request' | 'fatal' | 'completion';
  data: any;
  sandboxID: string;
  agentType: string;
}

async function handler(req: Request) {
  const { id } = (await req.json()) as Payload;

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  after(async () => {
    try {
      // Get the background agent
      const [agent] = await db
        .select()
        .from(backgroundAgentsTable)
        .where(eq(backgroundAgentsTable.id, id))
        .limit(1);

      if (!agent) {
        console.error(`[agent-status-check] Agent not found: ${id}`);
        return;
      }

      if (agent.status !== 'in_progress') {
        console.log(`[agent-status-check] Agent ${id} is not in progress (status: ${agent.status})`);
        return;
      }

      if (!agent.sandboxId) {
        console.error(`[agent-status-check] Agent ${id} has no sandbox ID`);
        return;
      }

      console.log(`[agent-status-check] Checking status for agent=${id} sandbox=${agent.sandboxId}`);

      try {
        const sandbox = await Sandbox.connect(agent.sandboxId);
        const isRunning = await sandbox.isRunning();

        if (!isRunning) {
          console.log(`[agent-status-check] Agent ${id} sandbox is not running, marking as failed`);
          await db
            .update(backgroundAgentsTable)
            .set({
              status: 'failed',
              completedAt: new Date()
            })
            .where(eq(backgroundAgentsTable.id, id));
          return;
        }


        try {
          const content = await sandbox.files.read('/tmp/shipvibes.jsonl');
          console.log(`[agent-status-check] agent=${id} logs`);

          // Parse JSONL format - split by lines and parse each line as JSON
          const lines = content.trim().split('\n').filter(line => line.trim());
          const logData: Log[] = [];

          for (const line of lines) {
            try {
              const logEntry = JSON.parse(line) as Log;
              logData.push(logEntry);
            } catch (parseError) {
              console.error(`[agent-status-check] Failed to parse log line: ${line}`, parseError);
            }
          }

          const prUrl = logData.find(log => log.type === 'pull-request')?.data?.html_url;

          if (prUrl) {
            console.log(`[agent-status-check] Agent ${id} completed successfully`);
            await db
              .update(backgroundAgentsTable)
              .set({
                status: 'done',
                completedAt: new Date(),
                prUrl: prUrl,
              })
              .where(eq(backgroundAgentsTable.id, id));



            try {
              await uploadLogs(id, logData);
            } catch (error) {
              console.error(`[agent-status-check] Failed to upload logs for agent id=${id}`, error);
            }
            await sandbox.kill();

          } else {
            console.log(`[agent-status-check] No pull request found for agent id=${id}`);
          }

        } catch (readError) {
          console.log(`[agent-status-check] No logs found for agent id=${id}`);
        }
      } catch (error) {
        console.error(`[agent-status-check] Failed to connect to sandbox id=${id}`, error);
        await db
          .update(backgroundAgentsTable)
          .set({
            status: 'failed',
            completedAt: new Date(),
          })
          .where(eq(backgroundAgentsTable.id, id));
      }
    } catch (error) {
      console.error(`[agent-status-check] Failed to check agent id=${id}`, error);
    }
  });

  return NextResponse.json({ ok: true });
}

const uploadLogs = async (id: string, logs: Log[]) => {
  for (const log of logs) {
    // Skip completion logs as they're not part of the database schema
    if (log.type === 'completion') continue;

    await db.insert(backgroundAgentLogsTable).values({
      agentId: id,
      type: log.type,
      data: log.data,
    });
  }
}

export const POST = verifySignatureAppRouter(handler);
