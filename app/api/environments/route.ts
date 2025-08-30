import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sandboxesTable, SandboxType } from '@/db/schema';

import { createVibeKitClient } from '@/lib/vibekit/utils';
import { getIntegrationByID } from '@/actions/integrations';
import { getVsCodeServerUrl } from '@/actions/vibekit';

export async function POST(request: NextRequest) {
  try {
    // For local development, use a default user ID
    const userId = 'local-user';
    const body = await request.json();
    const { name, plan, repositoryFullName } = body;

    if (!name || !plan) {
      return NextResponse.json(
        { success: false, error: 'Name and plan are required' },
        { status: 400 }
      );
    }

    const integration = await getIntegrationByID('github');
    const accessToken =
      (integration?.metadata as { accessToken: string })?.accessToken || '';

    let vibeKit = await createVibeKitClient();

    vibeKit = vibeKit.withGithub({
      token: accessToken,
      repository: repositoryFullName,
    });

    await vibeKit.generateCode({
      prompt: 'Do nothing. Just exit.',
      mode: 'ask',
    });

    const id = await vibeKit.getSession();
    const url = await getVsCodeServerUrl(id);


    const [created] = await db
      .insert(sandboxesTable)
      .values({
        userId: userId,
        name,
        githubRepo: repositoryFullName,
        type: plan as SandboxType,
        sandboxId: id,
        vscodeUrl: url,
        data: {
          name,
          plan,
          repository: repositoryFullName,
        },
      })
      .returning();

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error('Failed to create environment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create environment' },
      { status: 500 }
    );
  }
}
