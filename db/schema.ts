import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  jsonb,
  uuid,
  text,
} from 'drizzle-orm/pg-core';

export const backgroundAgentsTable = pgTable('background_agents', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: varchar('userId', { length: 255 }).notNull(),
  organizationId: varchar('organizationId', { length: 255 }).notNull(),
  repositoryFullName: varchar('repositoryFullName', { length: 255 }).notNull(),
  integrationId: varchar('integrationId', { length: 255 }).notNull(),
  environmentType: varchar('environmentType', { length: 255 }).notNull(),
  model: varchar('model', { length: 255 }).notNull(),
  prompt: text('prompt').notNull(),
  status: varchar('status', { enum: ['todo', 'in_progress', 'done', 'failed'] as const }).notNull().default('todo'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  prUrl: varchar('prUrl', { length: 512 }),
  sandboxId: varchar('sandboxId', { length: 255 }),
});

export type BackgroundAgent = InferSelectModel<typeof backgroundAgentsTable>;

export const integrationsTable = pgTable('integrations', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  type: varchar('type', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 }).notNull(),
  organizationId: varchar('organizationId', { length: 255 }).notNull(),
  externalId: varchar('externalId', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Integration = InferSelectModel<typeof integrationsTable>;

export const backgroundAgentLogsTable = pgTable('background_agent_logs', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  agentId: uuid('agentId').notNull(),
  type: varchar('type', { enum: ['log', 'error', 'pull-request', 'fatal'] as const }).notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type BackgroundAgentLog = InferSelectModel<typeof backgroundAgentLogsTable>;