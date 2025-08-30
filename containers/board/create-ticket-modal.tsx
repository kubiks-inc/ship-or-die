'use client';

import { useMemo, useTransition, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useGithubIntegration } from '@/hooks/use-integrations';
import { useGitHubRepositories } from '@/hooks/use-github';
import { getGithubInstallationUrl } from '@/lib/github/utils';
import Link from 'next/link';
import { MACHINE_OPTIONS, MODEL_OPTIONS, AgentModel, MachinePlan } from './types';


export interface CreateTicketValues {
  repositoryFullName: string;
  environmentType: MachinePlan;
  model: AgentModel;
  prompt: string;
  integrationId: string;
}

export function CreateTicketModal({ open, onOpenChange, onCreate }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (values: CreateTicketValues) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { data: githubIntegration, isLoading: isGithubIntegrationLoading } = useGithubIntegration();
  const { data: repositories, isLoading } = useGitHubRepositories();
  const sortedRepositories = useMemo(
    () => (repositories || []).slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [repositories]
  );

  const schema = z.object({
    repositoryFullName: z.string().min(1, 'Repository is required'),
    environmentType: z.string().min(1, 'Environment type is required'),
    model: z.string().min(1, 'Model is required'),
    prompt: z.string().min(1, 'Prompt is required'),
  });

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      repositoryFullName: '',
      environmentType: '2c-2g',
      model: 'auto',
      prompt: '',
    },
  });



  // Loading state while checking GitHub integration
  if (isGithubIntegrationLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Loading…</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!githubIntegration) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Connect your GitHub account to proceed.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <Link href={getGithubInstallationUrl('/board')}>
              <Button variant="outline">Connect GitHub</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Provide required details to start an agent.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4 py-2"
              onSubmit={form.handleSubmit(async values => {
                if (isPending) return;
                startTransition(() => {
                  const selectedRepo = sortedRepositories.find(r => r.full_name === values.repositoryFullName);
                  onCreate({
                    repositoryFullName: values.repositoryFullName,
                    environmentType: values.environmentType as MachinePlan,
                    model: values.model as AgentModel,
                    prompt: values.prompt,
                    integrationId: selectedRepo?.integrationId ?? '',
                  });
                  onOpenChange(false);
                  form.reset({ repositoryFullName: '', environmentType: '2c-2g', model: 'auto', prompt: '' });
                });
              })}
            >
              <FormField
                control={form.control}
                name="repositoryFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoading ? 'Loading repositories…' : 'Select repository'} />
                        </SelectTrigger>
                        <SelectContent className="w-full min-w-[420px] max-h-[50vh] overflow-y-auto">
                          {sortedRepositories.length === 0 ? (
                            <SelectItem disabled value="__empty__">No repositories</SelectItem>
                          ) : (
                            sortedRepositories.map(repo => (
                              <SelectItem key={repo.id} value={repo.full_name} className="w-full">
                                <div className="flex items-center w-full gap-2">
                                  <Badge variant="secondary">{repo.private ? 'Private' : 'Public'}</Badge>
                                  <span className="truncate">{repo.full_name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select machine" />
                        </SelectTrigger>
                        <SelectContent className="w-full min-w-[320px]">
                          {MACHINE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="w-full">
                              <span>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="w-full min-w-[320px]">
                          {MODEL_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="w-full">
                              <span>{opt.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what the background agent should do"
                        rows={10}
                        className="min-h-40 max-h-60 overflow-y-auto resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Creating…' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
