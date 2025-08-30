import useSWR from 'swr';
import { GitHubOrganization, GitHubRepository } from '@/lib/api/types/github';
import { SWRKeys } from './key';
import { getGitHubOrganization, getGitHubRepositories } from '@/actions/github';
import { getIntegrations } from '@/actions/integrations';
import { GithubMetadata } from '@/types/integrations/github';

export interface OrganizationWithRepos extends GitHubOrganization {
  repositories: GitHubRepository[];
}

export function useGitHubRepositories() {
  return useSWR([SWRKeys.githubRepositories], async () => {
    const integrations = await getIntegrations();
    const githubIntegrations = integrations.filter(
      i => i.type.toLowerCase() === 'github'
    );

    const result = await Promise.all(githubIntegrations.map(async (integration) => {
      const metadata = integration.metadata as GithubMetadata;
      const orgLogin = metadata.installationAccount.login;
      const installationId = metadata.installationId;

      return getGitHubRepositories(integration.id, installationId, orgLogin, metadata.installationAccount.type);
    }));

    return result.flat();
  });
}

export function useGitHubOrganization(login: string, token: string) {
  return useSWR([SWRKeys.githubOrganization, login], () =>
    getGitHubOrganization(login, token)
  );
}