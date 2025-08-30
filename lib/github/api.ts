import {
  GitHubTokenResponse,
  GitHubUserResponse,
} from '@/types/github';
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

export const getGithubToken = async (
  code: string
): Promise<GitHubTokenResponse> => {
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange authorization code');
  }

  const tokenData: GitHubTokenResponse = await tokenResponse.json();

  return tokenData;
};

export const getGithubUser = async (
  token: string
): Promise<GitHubUserResponse> => {
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch GitHub user');
  }

  const userData: GitHubUserResponse = await userResponse.json();

  return userData;
};

export const getGithubInstallation = async (
  installationId: string
) => {
  const client = getJWTOctokitClient();
  const installation = await client.rest.apps.getInstallation({
    installation_id: Number(installationId),
  });

  return installation.data;
};

export const getJWTOctokitClient = () => {
  const appId = Number(process.env.GITHUB_APP_ID);
  const privateKeyB64 = process.env.GITHUB_APP_PRIVATE_KEY_B64!;
  const pem = Buffer.from(privateKeyB64, 'base64').toString('utf8');

  return new Octokit({
    authStrategy: createAppAuth,
    auth: { appId, privateKey: pem },
  });
};

export const getBotToken = async (installationId: string): Promise<string> => {
  const appId = process.env.GITHUB_APP_ID!;
  const privateKeyB64 = process.env.GITHUB_APP_PRIVATE_KEY_B64!;
  const pem = Buffer.from(privateKeyB64, 'base64').toString('utf8');
  const privateKey = pem;

  const auth = createAppAuth({ appId, privateKey });
  const { token } = await auth({ type: "installation", installationId });
  return token;
};