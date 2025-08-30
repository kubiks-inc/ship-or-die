export const SWRKeys = {
  organizations: 'organizations',
  integrations: 'integrations',
  integration: (id: string) => `integration-${id}`,
  organizationStatus: 'organizationStatus',
  githubRepositories: 'githubRepositories',
  githubOrganization: 'githubOrganization',
};
