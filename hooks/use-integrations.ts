import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { deleteIntegration, getIntegrationByID, getIntegrations } from '@/actions/integrations';
import { SWRKeys } from './key';

export function useIntegrations() {
  const {
    data: integrations,
    error,
    isLoading,
  } = useSWR(SWRKeys.integrations, () => getIntegrations());
  return {
    data: integrations,
    isLoading,
    error,
  };
}

export function useDeleteIntegration() {
  const { trigger, isMutating, error } = useSWRMutation(
    SWRKeys.integration('github'),
    async (url: string, { arg }: { arg: string }) => {
      await deleteIntegration(arg);
      mutate(SWRKeys.integrations);
    }
  );
  return {
    trigger,
    isMutating,
    error,
  };
}

export function useGithubIntegration() {
  const {
    data: githubIntegration,
    error,
    isLoading,
  } = useSWR(SWRKeys.integration('github'), () => getIntegrationByID('github'));
  return {
    data: githubIntegration,
    isLoading,
    error,
  };
}