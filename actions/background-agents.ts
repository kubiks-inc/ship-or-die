'use server';

import { db } from '@/lib/db';
import { backgroundAgentsTable, type BackgroundAgent } from '@/db/schema';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { Client as QStashClient } from '@upstash/qstash';
import { Sandbox } from '@e2b/code-interpreter'

export type CreateBackgroundAgentInput = {
  repositoryFullName: string;
  integrationId: string;
  environmentType: string;
  model: string;
  prompt: string;
};

export async function listBackgroundAgents(): Promise<BackgroundAgent[]> {
  // For local development, use a default organization ID
  const organizationId = 'local-dev';
  const rows = await db
    .select()
    .from(backgroundAgentsTable)
    .where(
      and(
        eq(backgroundAgentsTable.organizationId, organizationId!),
      )
    )
    .orderBy(desc(backgroundAgentsTable.createdAt));
  return rows;
}

export async function createBackgroundAgent(input: CreateBackgroundAgentInput): Promise<BackgroundAgent> {
  // For local development, use default values
  const userId = 'local-user';
  const organizationId = 'local-dev';
  const [row] = await db
    .insert(backgroundAgentsTable)
    .values({
      userId: userId,
      organizationId: organizationId,
      repositoryFullName: input.repositoryFullName,
      integrationId: input.integrationId,
      environmentType: input.environmentType,
      model: input.model,
      prompt: input.prompt,
      status: 'todo',
    })
    .returning();

  // Fire-and-forget: enqueue background processing via Upstash QStash
  // Do not block the user on queue errors
  try {
    const qstashClient = new QStashClient({ token: process.env.QSTASH_TOKEN! });
    const baseUrl = process.env.QSTASH_CALLBACK_URL!;
    await qstashClient.publishJSON({
      url: `${baseUrl}/api/background-agents/queue`,
      body: { id: row.id },
    });
  } catch (error) {
    console.error('[QSTASH_PUBLISH_ERROR]', error);
  }

  revalidatePath('/board');
  return row as BackgroundAgent;
}

export async function stopBackgroundAgent(id: string): Promise<BackgroundAgent | null> {
  try {
    const [row] = await db
      .select()
      .from(backgroundAgentsTable)
      .where(eq(backgroundAgentsTable.id, id))
      .limit(1);

    const sandboxId = row?.sandboxId;
    if (sandboxId) {
      const sandbox = await Sandbox.connect(sandboxId);
      await sandbox.kill();
    }
  } catch (error) {
    console.error("Error killing sandbox:", error);
  }

  const [row] = await db
    .update(backgroundAgentsTable)
    .set({ status: 'failed', completedAt: new Date() })
    .where(eq(backgroundAgentsTable.id, id))
    .returning();
  return row ?? null;
}