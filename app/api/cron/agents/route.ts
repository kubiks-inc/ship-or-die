import { NextResponse } from 'next/server';
import { eq, and, isNotNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { backgroundAgentsTable } from '@/db/schema';
import { Client as QStashClient } from '@upstash/qstash';
import { after } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';

async function handler(req: Request) {
  after(async () => {
    try {
      const agents = await db
        .select()
        .from(backgroundAgentsTable)
        .where(and(eq(backgroundAgentsTable.status, 'in_progress'), isNotNull(backgroundAgentsTable.sandboxId)));

      console.log(`[background-cron] Found ${agents.length} in-progress agents`);

      // Submit Upstash events for each in-progress agent
      const qstashClient = new QStashClient({ token: process.env.QSTASH_TOKEN! });
      const baseUrl = process.env.QSTASH_CALLBACK_URL!;

      for (const agent of agents) {
        try {
          await qstashClient.publishJSON({
            url: `${baseUrl}/api/cron/agents/${agent.id}`,
            body: { id: agent.id },
          });
          console.log(`[background-cron] Submitted status check for agent=${agent.id}`);
        } catch (error) {
          console.error(`[background-cron] Failed to submit status check for agent=${agent.id}`, error);
        }
      }

    } catch (error) {
      console.error('[background-cron] Unexpected error', error);
      return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
  });

  return NextResponse.json({ ok: true });
}

export const POST = verifySignatureAppRouter(handler);