'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Github, Trash2 } from 'lucide-react';
import { Integration } from '@/db/schema';
import { useDeleteIntegration } from '@/hooks/use-integrations';

export function IntegrationCardWrapper({
  integration,
}: {
  integration: Integration;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { trigger, isMutating: isDeleting, error } = useDeleteIntegration();

  const isDefaultIntegration = integration.type.toLowerCase() === 'default';

  const handleDelete = async () => {
    try {
      await trigger(integration.id);
      router.refresh();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete integration:', error);
    }
  };

  return (
    <>
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 bg-card border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      >
        <div className="flex items-start sm:items-center gap-4 w-full">
          <div className="flex-shrink-0">
            <Github className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-foreground truncate">
              {integration.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm text-muted-foreground capitalize">
                {integration.type}
              </p>
              <span className="text-sm text-muted-foreground">•</span>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(integration.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end sm:ml-auto">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete integration"
            onClick={e => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
            disabled={isDeleting || isDefaultIntegration}
            className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete the integration{' '}
                <span className="font-medium text-foreground">
                  {integration.name}
                </span>
                ?
              </p>
              <p className="text-muted-foreground">
                This action cannot be undone and will remove all data and
                configuration for this integration.
              </p>
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
              Failed to delete integration. Please try again.
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              {isDeleting ? 'Deleting...' : 'Delete Integration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
