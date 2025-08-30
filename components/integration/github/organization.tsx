import { useGitHubOrganization } from '@/hooks/use-github';

export function Organization({
  login,
  token,
}: {
  login: string;
  token: string;
}) {
  const { data, isLoading, error } = useGitHubOrganization(login, token);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {data?.avatar_url ? (
          <img
            src={data.avatar_url}
            alt={data.name || 'U'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-lg font-semibold">
            {(data?.name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground"> Connected</p>
        <p className="font-medium"> {data?.name} </p>
        <p className="text-sm text-muted-foreground"> @{data?.login} </p>
      </div>
    </div>
  );
}
