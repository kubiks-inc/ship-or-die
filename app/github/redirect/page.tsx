import { installGithubIntegration } from '@/lib/github/integration';
import { GithubInstallation } from '@/types/github';
import { redirect } from 'next/navigation';


interface PageProps {
  searchParams: Promise<{
    state?: string;
    code?: string;
    installation_id?: string;
  }>;
}

export default async function RedirectPage({ searchParams }: PageProps) {
  // For local development, use a default organization ID
  const organizationId = 'local-dev';
  const { state, installation_id } = await searchParams;

  if (!state || !installation_id) {
    throw new Error('Missing state or installation_id');
  }

  const decodedState = Buffer.from(state, 'base64').toString('utf-8');
  const parsedState = JSON.parse(decodedState) as GithubInstallation;
  const redirectUrl = new URL(
    parsedState.redirectUrl,
    process.env.NEXT_PUBLIC_BASE_URL
  );

  const integration = await installGithubIntegration(
    installation_id as string,
    organizationId,
  );

  redirect(redirectUrl.toString());
}
