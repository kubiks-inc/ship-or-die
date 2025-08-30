'use server';

import { db } from '@/lib/db';
import {
  integrationsTable,
  type Integration as DBIntegration,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';


export async function getIntegrations() {
  try {
    // For local development, use a default organization ID
    const organizationId = 'local-dev';

    // Query the database directly for integrations
    const dbIntegrations = await db
      .select()
      .from(integrationsTable)
      .where(eq(integrationsTable.organizationId, organizationId));

    return dbIntegrations;
  } catch (error) {
    console.error('Failed to fetch integrations from database:', error);
    return [];
  }
}

export async function getIntegrationByID(
  integrationId: string | number
): Promise<DBIntegration | null> {
  try {
    const organizationId = "local-dev";

    // Query the database directly by filtering by type and userId
    const [integration] = await db
      .select()
      .from(integrationsTable)
      .where(
        and(
          eq(integrationsTable.type, integrationId.toString()),
          eq(integrationsTable.organizationId, organizationId!)
        )
      );

    return integration || null;
  } catch (error) {
    console.error('Failed to fetch integration by ID:', error);
    return null;
  }
}

export async function deleteIntegration(integrationId: string) {
  const organizationId = "local-dev";
  await db.delete(integrationsTable).where(and(eq(integrationsTable.id, integrationId), eq(integrationsTable.organizationId, organizationId!)));
}