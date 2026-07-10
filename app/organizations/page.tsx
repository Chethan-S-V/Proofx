import { OrganizationDiscovery } from "../../src/features/organizations/components/organization-discovery";
import { getServerUser } from "../../src/lib/auth/service";
import { listOrganizationsForDiscovery } from "../../src/features/organizations/organization.service";
import { db, organizationFollowsTable } from "../../src/db";
import { eq } from "drizzle-orm";

type OrganizationsPageProps = {
  searchParams: Promise<{
    industry?: string;
    location?: string;
    q?: string;
    type?: string;
    verified?: string;
  }>;
};

export default async function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const [params, user] = await Promise.all([searchParams, getServerUser()]);
  const data = await listOrganizationsForDiscovery({
    industry: params.industry,
    location: params.location,
    query: params.q,
    type: params.type,
    verified: params.verified,
  });
  const follows = user ? await db.select({ organizationId: organizationFollowsTable.organizationId }).from(organizationFollowsTable).where(eq(organizationFollowsTable.userId, user.id)) : [];

  return (
    <OrganizationDiscovery
      canFollow={Boolean(user)}
      data={data}
      filters={{ industry: params.industry, location: params.location, query: params.q, type: params.type, verified: params.verified }}
      followedOrganizationIds={follows.map((follow) => follow.organizationId)}
    />
  );
}
