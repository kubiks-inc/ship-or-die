import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getIntegrationByID } from '@/actions/integrations';
import { GithubMetadata } from '@/types/integrations/github';
import { createVibeKitClient } from '@/lib/vibekit/utils';
import { getChatById } from '@/lib/chat/db/queries';
import { getChatEnvironment } from '@/actions/environment';

export async function POST(request: Request) {
  try {
    const { chatId } = await request.json();

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    const environment = await getChatEnvironment(chatId);
    const integration = await getIntegrationByID('github');

    if (!integration || !integration.metadata) {
      return NextResponse.json(
        { error: 'GitHub integration not found' },
        { status: 404 }
      );
    }

    const metadata = integration.metadata as unknown as GithubMetadata;
    const accessToken = '';

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing GitHub access token' },
        { status: 400 }
      );
    }

    let vibeKit = await createVibeKitClient();
    vibeKit = vibeKit.withGithub({ token: accessToken, repository: environment.githubRepo });

    vibeKit = vibeKit.withSession(environment.sandboxId);


    const prResponse = await vibeKit.createPullRequest();

    return NextResponse.json({
      id: prResponse.id,
      number: prResponse.number,
      url: prResponse.html_url,
      title: prResponse.title,
      state: prResponse.state,
    });
  } catch (error: any) {
    console.error('Failed to create PR:', error);
    return NextResponse.json({ error: 'Failed to create PR' }, { status: 500 });
  }
}
