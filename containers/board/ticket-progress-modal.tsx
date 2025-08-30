'use client';

import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BackgroundAgent } from '@/db/schema';

export function TicketProgressModal({ open, onOpenChange, ticket, onStop }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  ticket: BackgroundAgent | null;
  onStop: (ticketId: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, ticket]);

  if (!ticket) return null;

  const createdAtMs = ticket.createdAt.getTime();
  const completedAtMs = ticket.completedAt?.getTime() ?? Date.now();
  const runtimeSec = ticket.startedAt ? Math.floor((completedAtMs - createdAtMs) / 1000) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Running Task
            <Badge variant="secondary">In progress</Badge>
          </DialogTitle>
          <DialogDescription>Task is currently running</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Repository</div>
              <div className="font-medium truncate">{ticket.repositoryFullName}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Environment</div>
              <div className="font-medium">{ticket.environmentType}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Model</div>
              <div className="font-medium">{ticket.model}</div>
            </div>
          </div>

          <Progress value={Math.min(100, runtimeSec * 10)} />

          <div>
            <div className="text-sm text-muted-foreground mb-1">Original Prompt</div>
            <div className="bg-muted rounded-md p-3 text-sm max-h-60 overflow-y-auto">
              <div className="whitespace-pre-wrap">{ticket.prompt}</div>
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={() => onStop(ticket.id)}>Stop agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


