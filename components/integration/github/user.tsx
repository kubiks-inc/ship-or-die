import { useGitHubOrganization } from '@/hooks/use-github';

export type Props = {
  avatarUrl: string;
  name: string;
  login: string;
};

export function User({ avatarUrl, name, login }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name || 'U'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-lg font-semibold">
            {(name || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground"> Connected</p>
        <p className="font-medium"> {name} </p>
        <p className="text-sm text-muted-foreground"> @{login} </p>
      </div>
    </div>
  );
}
