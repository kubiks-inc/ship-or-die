import { GithubInstallation } from '@/types/github';

export const getGithubInstallationUrl = (redirectUrl: string) => {
  const botId = process.env.NEXT_PUBLIC_GITHUB_APP_NAME;

  const state: GithubInstallation = {
    redirectUrl,
  };

  const stateString = JSON.stringify(state);
  const encodedState = Buffer.from(stateString).toString('base64');

  return `https://github.com/apps/${botId}/installations/new?state=${encodedState}`;
};