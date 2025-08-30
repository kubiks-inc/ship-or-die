'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { BackgroundAgent } from '@/db/schema';

export function TicketDetailsModal({ open, onOpenChange, ticket }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: BackgroundAgent | null;
}) {
  if (!ticket) return null;

  const completedAt = ticket.completedAt ? new Date(ticket.completedAt) : null;
  const createdAt = new Date(ticket.createdAt);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Task Details
            {ticket.status === 'failed' ? (
              <Badge variant="destructive">Failed</Badge>
            ) : (
              <Badge>Completed</Badge>
            )}
          </DialogTitle>
          <DialogDescription>Summary and outputs</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Repository</div>
              <div className="font-medium">{ticket.repositoryFullName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Environment</div>
              <div className="font-medium">{ticket.environmentType}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Model</div>
              <div className="font-medium">{ticket.model}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">{createdAt.toLocaleString()}</div>
            </div>
            {completedAt ? (
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="font-medium">{completedAt.toLocaleString()}</div>
              </div>
            ) : null}
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-1">Agent Prompt</div>
            <pre className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">{ticket.prompt}</pre>
          </div>

          {/* Logs are not part of BackgroundAgent schema; omit for now */}

          {ticket.prUrl ? (
            <div className="flex justify-end">
              <Link href={ticket.prUrl} target="_blank" rel="noopener noreferrer">
                <Button>View Pull Request</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}


