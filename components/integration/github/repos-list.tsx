'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Lock, Unlock } from 'lucide-react';
import { useGitHubRepositories } from '@/hooks/use-github';

export function ReposList() {
  const { data: repositories, error, isLoading } = useGitHubRepositories();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Repositories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4 text-sm">
            Loading repositories...
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-4 text-sm">
            Error loading repositories: {error.message}
          </div>
        ) : !repositories || repositories.length === 0 ? (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No repositories found
          </p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {repositories.map(repo => (
              <li
                key={repo.id}
                className="flex items-center space-x-3 py-2 px-3 rounded-md border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{repo.name}</span>
                    {repo.private ? (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-3 w-3 text-muted-foreground" />
                    )}
                    {repo.fork && (
                      <Badge variant="outline" className="text-xs">
                        Fork
                      </Badge>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {repo.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
