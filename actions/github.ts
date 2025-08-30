'use server';

import { GitHubOrganization, GitHubRepository } from '@/lib/api/types/github';
import { getBotToken } from '@/lib/github/api';

export async function getGitHubRepositories(
  integrationId: string,
  installationId: string,
  login: string,
  type: string,
): Promise<GitHubRepository[]> {
  const botToken = await getBotToken(installationId);
  return getInstallationRepositories(integrationId, login, botToken);
}

const getInstallationRepositories = async (
  integrationId: string,
  login: string,
  token: string
) => {
  const response = await fetch(`https://api.github.com/installation/repositories?per_page=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const repos = (await response.json()) as { repositories: GitHubRepository[] };
  return repos.repositories.map(repo => ({ ...repo, integrationId }));
};

export async function getGitHubOrganization(
  login: string,
  token: string
): Promise<GitHubOrganization> {
  const response = await fetch(`https://api.github.com/orgs/${login}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
}