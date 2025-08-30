'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Loader2 } from 'lucide-react';
import { CreateTicketModal, CreateTicketValues } from './create-ticket-modal';
import { TicketProgressModal } from './ticket-progress-modal';
import { TicketDetailsModal } from './ticket-details-modal';
import { MACHINE_OPTIONS, MODEL_OPTIONS } from './types';
import { BackgroundAgent } from '@/db/schema';
import { PageHeaderWithTitle } from '@/containers/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { nanoid } from 'nanoid';
import { formatDistanceToNow } from 'date-fns';
import { useBackgroundAgents } from '@/hooks/use-background-agents';
import { createBackgroundAgent, stopBackgroundAgent } from '@/actions/background-agents';
import { Input } from '@/components/ui/input';

function ColumnHeader({ title, count, action }: { title: string; count: number; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary">{count}</Badge>
      </div>
      {action}
    </div>
  );
}

function TicketCard({ ticket, onClick }: { ticket: BackgroundAgent; onClick: () => void }) {
  const modelLabel = MODEL_OPTIONS.find(o => o.value === ticket.model)?.label ?? ticket.model;
  const envLabel = MACHINE_OPTIONS.find(o => o.value === ticket.environmentType)?.label ?? ticket.environmentType;
  const submitted = formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true });
  return (
    <Card className="hover:bg-accent/40 transition-colors cursor-pointer gap-2 py-2" onClick={onClick}>
      <CardHeader className="py-1.5 px-3">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <span className="flex-1 min-w-0 line-clamp-1">{ticket.repositoryFullName}</span>
          {ticket.status === 'in_progress' ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <Badge variant="secondary">Running</Badge>
            </span>
          ) : ticket.status === 'todo' ? (
            <Badge variant="secondary">To Do</Badge>
          ) : ticket.status === 'failed' ? (
            <Badge variant="destructive">Failed</Badge>
          ) : (
            <Badge>Done</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-1 text-sm text-muted-foreground">
        <div className="line-clamp-2">{ticket.prompt}</div>
      </CardContent>
      <CardFooter className="px-3 py-1.5 text-xs justify-between gap-2 flex-wrap border-t">
        <div className="text-muted-foreground">submitted {submitted}</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto">{envLabel}</Badge>
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-auto">{modelLabel}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

function SkeletonTicketCard() {
  return (
    <Card className="gap-2 py-2">
      <CardHeader className="py-1.5 px-3">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <div className="ml-auto inline-flex items-center gap-1">
            <Skeleton className="h-4 w-16" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-1 text-sm text-muted-foreground space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
      <CardFooter className="px-3 py-1.5 text-xs justify-between gap-2 flex-wrap border-t">
        <Skeleton className="h-3 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function Board() {
  const { data: agents, mutate, isLoading } = useBackgroundAgents();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [detailsTicketId, setDetailsTicketId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return agents;
    return agents.filter(a => {
      const haystack = `${a.repositoryFullName}\n${a.prompt}\n${a.model}\n${a.status}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [agents, searchQuery]);

  const todoTickets = useMemo(() => filteredTickets.filter(t => t.status === 'todo'), [filteredTickets]);
  const inProgressTickets = useMemo(() => filteredTickets.filter(t => t.status === 'in_progress'), [filteredTickets]);
  const doneTickets = useMemo(() => filteredTickets.filter(t => t.status === 'done' || t.status === 'failed'), [filteredTickets]);

  const activeTicket = useMemo(() => agents.find(a => a.id === activeTicketId) ?? null, [agents, activeTicketId]);
  const detailsTicket = useMemo(() => agents.find(a => a.id === detailsTicketId) ?? null, [agents, detailsTicketId]);

  return (
    <div className="w-full">
      <PageHeaderWithTitle title="Agents" >
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks…"
            className="w-full sm:w-[240px] md:w-[260px]"
          />
          <Button className="w-full sm:w-auto" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </div>
      </PageHeaderWithTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start p-4 md:p-6">
        <Card className="flex flex-col h-auto">
          <CardHeader>
            <ColumnHeader title="To Do" count={todoTickets.length} action={
              <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            } />
          </CardHeader>
          <CardContent className="overflow-visible">
            <ScrollArea className="pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTicketCard key={i} />)
                ) : todoTickets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Create task to get started.</div>
                ) : (
                  todoTickets.map(a => (
                    <TicketCard key={a.id} ticket={a} onClick={() => setActiveTicketId(a.id)} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-auto">
          <CardHeader>
            <ColumnHeader title="In Progress" count={inProgressTickets.length} />
          </CardHeader>
          <CardContent className="overflow-visible">
            <ScrollArea className="pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTicketCard key={i} />)
                ) : inProgressTickets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No running agents.</div>
                ) : (
                  inProgressTickets.map(t => (
                    <TicketCard key={t.id} ticket={t} onClick={() => setActiveTicketId(t.id)} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-auto">
          <CardHeader>
            <ColumnHeader title="Done" count={doneTickets.length} />
          </CardHeader>
          <CardContent className="overflow-visible">
            <ScrollArea className="pr-2">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonTicketCard key={i} />)
                ) : doneTickets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No completed tasks yet.</div>
                ) : (
                  doneTickets.map(t => (
                    <TicketCard key={t.id} ticket={t} onClick={() => setDetailsTicketId(t.id)} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <CreateTicketModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={async (values) => {
          await createBackgroundAgent({
            repositoryFullName: values.repositoryFullName,
            integrationId: values.integrationId,
            environmentType: values.environmentType,
            model: values.model,
            prompt: values.prompt,
          });
          mutate();
        }}
      />

      <TicketProgressModal
        open={!!activeTicket}
        onOpenChange={(v) => !v && setActiveTicketId(null)}
        ticket={activeTicket}
        onStop={async (id) => {
          await stopBackgroundAgent(id);
          setActiveTicketId(null);
          mutate();
        }}
      />

      <TicketDetailsModal
        open={!!detailsTicket}
        onOpenChange={(v) => !v && setDetailsTicketId(null)}
        ticket={detailsTicket}
      />
    </div>
  );
}


