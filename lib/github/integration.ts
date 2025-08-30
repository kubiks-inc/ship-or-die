import { db } from '../db';
import { integrationsTable } from '@/db/schema';
import { getGithubInstallation, getGithubToken, getGithubUser } from './api';
import { GithubMetadata } from '@/types/integrations/github';
import { Integration } from '@/db/schema';


export const installGithubIntegration = async (
  installationId: string,
  organizationId: string,
): Promise<Integration> => {
  const userId = "local-user";
  const installationData = await getGithubInstallation(
    installationId
  );

  const metadata: GithubMetadata = {
    installationId,
    installationAccount: {
      // @ts-ignore
      login: installationData?.account?.login || '',
      // @ts-ignore
      type: installationData?.account?.type || '',
      avatarUrl: installationData?.account?.avatar_url || '',
      htmlUrl: installationData?.account?.html_url || '',
    },
  };


  // Insert directly into database
  const [integration] = await db
    .insert(integrationsTable)
    .values({
      userId: userId,
      type: 'github',
      metadata,
      organizationId,
      // @ts-ignore
      name: installationData?.account?.login || '',
    })
    .returning();

  return integration;
};