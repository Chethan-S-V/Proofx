import { and, count, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  db,
  organizationAuditLogsTable,
  organizationCandidatePipelineTable,
  organizationCandidateStageHistoryTable,
  organizationDepartmentsTable,
  organizationFollowsTable,
  organizationJobsTable,
  organizationMemberRolesTable,
  organizationMembersTable,
  organizationPermissionsTable,
  organizationPostsTable,
  organizationRolePermissionsTable,
  organizationRolesTable,
  organizationsTable,
  organizationTeamsTable,
  proofVerificationEventsTable,
  proofVerificationRequestsTable,
  usersTable,
  type Organization,
  type OrganizationRoleKey,
} from "../../db";
import { getDashboardProfile } from "../../lib/profile/service";
import { getServerUser, type AuthUser } from "../../lib/auth/service";
import {
  candidatePipelineSchema,
  organizationCreateSchema,
  organizationDepartmentSchema,
  organizationFollowSchema,
  organizationInviteSchema,
  organizationJobSchema,
  organizationMembershipRequestSchema,
  organizationOnboardingSchema,
  organizationPostSchema,
  organizationTeamSchema,
  proofVerificationDecisionSchema,
  proofVerificationRequestSchema,
  talentSearchSchema,
} from "./organization.schemas";
import { organizationPermissions, rolePermissionMatrix, rolesHavePermission, type OrganizationPermissionKey } from "./organization-permissions.service";
import { uploadOrganizationMedia } from "./organization-media.service";
import { organizationTypeValues, type OrganizationType } from "./organization.constants";

const defaultRoles: Array<{ key: OrganizationRoleKey; name: string; description: string }> = [
  { key: "OWNER", name: "Owner", description: "Full organization control, including ownership and danger zone actions." },
  { key: "ADMIN", name: "Admin", description: "Broad administration without delete ownership authority." },
  { key: "HR_MANAGER", name: "HR Manager", description: "Manage membership, jobs, and hiring workflows." },
  { key: "RECRUITER", name: "Recruiter", description: "Discover, contact, and move candidates through the pipeline." },
  { key: "TEAM_MANAGER", name: "Team Manager", description: "Coordinate team members, activity, and scoped collaboration." },
  { key: "PROOF_VERIFIER", name: "Proof Verifier", description: "Review and verify organization-connected proof." },
  { key: "CHALLENGE_MANAGER", name: "Challenge Manager", description: "Create and manage sponsored challenges." },
  { key: "CONTENT_MANAGER", name: "Content Manager", description: "Publish and manage organization content." },
  { key: "ANALYST", name: "Analyst", description: "View organization analytics and trust signals." },
  { key: "MEMBER", name: "Member", description: "Basic professional organization membership." },
];

function getText(value: FormDataEntryValue | null) {
  return value?.toString() ?? "";
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File ? value : null;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64);
}

function slugWithSuffix(baseSlug: string, suffix: number) {
  const suffixText = `-${suffix}`;
  return `${baseSlug.slice(0, 64 - suffixText.length)}${suffixText}`;
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}

function safeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !key.toLowerCase().includes("secret") && !key.toLowerCase().includes("password")));
}

async function requireUser() {
  const user = await getServerUser();

  if (!user) {
    throw new Error("User session was not found.");
  }

  return user;
}

async function getCount(query: Promise<Array<{ value: number }>>) {
  const [result] = await query;
  return result?.value ?? 0;
}

async function assertSlugAvailable(slug: string, organizationId?: string) {
  const [existing] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(organizationId ? sql`${organizationsTable.slug} = ${slug} and ${organizationsTable.id} <> ${organizationId}` : eq(organizationsTable.slug, slug))
    .limit(1);

  if (existing) {
    throw new Error("That organization slug is already taken.");
  }
}

async function auditOrganizationAction(input: {
  action: string;
  actorId: string | null;
  metadata?: Record<string, unknown>;
  organizationId: string;
  targetId?: string | null;
  targetType?: string | null;
}) {
  await db.insert(organizationAuditLogsTable).values({
    action: input.action,
    actorId: input.actorId,
    metadata: input.metadata ? safeMetadata(input.metadata) : null,
    organizationId: input.organizationId,
    targetId: input.targetId ?? null,
    targetType: input.targetType ?? null,
  });
}

async function ensurePermissionRows() {
  for (const permission of organizationPermissions) {
    await db
      .insert(organizationPermissionsTable)
      .values({ key: permission, description: permission.replace(/\./g, " ") })
      .onConflictDoNothing();
  }
}

async function ensureOrganizationRoles(organizationId: string) {
  await ensurePermissionRows();

  for (const role of defaultRoles) {
    await db
      .insert(organizationRolesTable)
      .values({ description: role.description, key: role.key, name: role.name, organizationId })
      .onConflictDoNothing();
  }

  const [roles, permissions] = await Promise.all([
    db.select().from(organizationRolesTable).where(eq(organizationRolesTable.organizationId, organizationId)),
    db.select().from(organizationPermissionsTable),
  ]);

  for (const role of roles) {
    const permissionKeys = rolePermissionMatrix[role.key] ?? [];

    for (const permissionKey of permissionKeys) {
      const permission = permissions.find((item) => item.key === permissionKey);

      if (!permission) {
        continue;
      }

      await db.insert(organizationRolePermissionsTable).values({ permissionId: permission.id, roleId: role.id }).onConflictDoNothing();
    }
  }

  return roles;
}

async function getMemberRoles(organizationId: string, userId: string): Promise<OrganizationRoleKey[]> {
  const rows = await db
    .select({ roleKey: organizationRolesTable.key, status: organizationMembersTable.status })
    .from(organizationMembersTable)
    .innerJoin(organizationMemberRolesTable, eq(organizationMemberRolesTable.memberId, organizationMembersTable.id))
    .innerJoin(organizationRolesTable, eq(organizationRolesTable.id, organizationMemberRolesTable.roleId))
    .where(and(eq(organizationMembersTable.organizationId, organizationId), eq(organizationMembersTable.userId, userId)));

  return rows.filter((row) => row.status === "active").map((row) => row.roleKey);
}

export async function hasOrganizationPermission(organizationId: string, userId: string, permission: OrganizationPermissionKey) {
  const roles = await getMemberRoles(organizationId, userId);
  return rolesHavePermission(roles, permission);
}

export async function requireOrganizationPermission(organizationId: string, userId: string, permission: OrganizationPermissionKey) {
  if (!(await hasOrganizationPermission(organizationId, userId, permission))) {
    throw new Error("You do not have permission to perform this organization action.");
  }
}

export async function getOrganizationBySlug(slug: string, userId?: string) {
  const [organization] = await db.select().from(organizationsTable).where(eq(organizationsTable.slug, slug)).limit(1);

  if (!organization) {
    return null;
  }

  const [isFollowing, memberRoles, followerCount, memberCount, departments, teams, posts, jobs, proofRequests, auditLogs] = await Promise.all([
    userId
      ? db
          .select({ id: organizationFollowsTable.id })
          .from(organizationFollowsTable)
          .where(and(eq(organizationFollowsTable.organizationId, organization.id), eq(organizationFollowsTable.userId, userId)))
          .limit(1)
          .then((rows) => rows.length > 0)
      : false,
    userId ? getMemberRoles(organization.id, userId) : Promise.resolve([]),
    getCount(db.select({ value: count() }).from(organizationFollowsTable).where(eq(organizationFollowsTable.organizationId, organization.id))),
    getCount(db.select({ value: count() }).from(organizationMembersTable).where(and(eq(organizationMembersTable.organizationId, organization.id), eq(organizationMembersTable.status, "active")))),
    db.select().from(organizationDepartmentsTable).where(eq(organizationDepartmentsTable.organizationId, organization.id)).orderBy(desc(organizationDepartmentsTable.createdAt)).limit(12),
    db.select().from(organizationTeamsTable).where(eq(organizationTeamsTable.organizationId, organization.id)).orderBy(desc(organizationTeamsTable.createdAt)).limit(12),
    db.select().from(organizationPostsTable).where(eq(organizationPostsTable.organizationId, organization.id)).orderBy(desc(organizationPostsTable.createdAt)).limit(6),
    db.select().from(organizationJobsTable).where(eq(organizationJobsTable.organizationId, organization.id)).orderBy(desc(organizationJobsTable.createdAt)).limit(6),
    db.select().from(proofVerificationRequestsTable).where(eq(proofVerificationRequestsTable.organizationId, organization.id)).orderBy(desc(proofVerificationRequestsTable.createdAt)).limit(6),
    db.select().from(organizationAuditLogsTable).where(eq(organizationAuditLogsTable.organizationId, organization.id)).orderBy(desc(organizationAuditLogsTable.createdAt)).limit(10),
  ]);

  return {
    auditLogs,
    departments,
    followerCount,
    isFollowing,
    jobs,
    memberCount,
    memberRoles,
    organization: { ...organization, followerCount, memberCount },
    posts,
    proofRequests,
    teams,
  };
}

export async function listOrganizationsForDashboard(userId: string) {
  const organizations = await db.select().from(organizationsTable).orderBy(desc(organizationsTable.createdAt)).limit(24);
  const memberships = await db
    .select({ organizationId: organizationMembersTable.organizationId, status: organizationMembersTable.status })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userId));
  const follows = await db.select({ organizationId: organizationFollowsTable.organizationId }).from(organizationFollowsTable).where(eq(organizationFollowsTable.userId, userId));
  const verifiedCount = organizations.filter((organization) => organization.verificationStatus === "verified").length;
  const pendingCount = organizations.filter((organization) => organization.verificationStatus !== "verified").length;
  const activeMemberCount = memberships.filter((membership) => membership.status === "active").length;

  return {
    follows,
    memberships,
    organizations,
    stats: {
      activeMemberCount,
      pendingCount,
      total: organizations.length,
      verifiedCount,
    },
  };
}

export async function listOrganizationsForDiscovery(input: {
  industry?: string;
  location?: string;
  query?: string;
  type?: string;
  verified?: string;
}) {
  const normalizedQuery = input.query?.trim().toLowerCase();
  const normalizedIndustry = input.industry?.trim().toLowerCase();
  const normalizedLocation = input.location?.trim().toLowerCase();
  const conditions = [];

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    conditions.push(sql`
      lower(
        ${organizationsTable.name}
        || ' '
        || coalesce(${organizationsTable.tagline}, '')
        || ' '
        || coalesce(${organizationsTable.industry}, '')
        || ' '
        || ${organizationsTable.type}
        || ' '
        || coalesce(${organizationsTable.city}, '')
        || ' '
        || coalesce(${organizationsTable.country}, '')
      ) like ${pattern}
    `);
  }

  if (organizationTypeValues.includes(input.type as OrganizationType)) {
    conditions.push(eq(organizationsTable.type, input.type as OrganizationType));
  }

  if (normalizedIndustry) {
    conditions.push(sql`lower(coalesce(${organizationsTable.industry}, '')) like ${`%${normalizedIndustry}%`}`);
  }

  if (normalizedLocation) {
    conditions.push(sql`
      lower(
        coalesce(${organizationsTable.headquarters}, '')
        || ' '
        || coalesce(${organizationsTable.city}, '')
        || ' '
        || coalesce(${organizationsTable.state}, '')
        || ' '
        || coalesce(${organizationsTable.country}, '')
      ) like ${`%${normalizedLocation}%`}
    `);
  }

  if (input.verified === "true") {
    conditions.push(eq(organizationsTable.verificationStatus, "verified"));
  }

  const organizations = await db
    .select()
    .from(organizationsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(organizationsTable.verificationStatus), desc(organizationsTable.followerCount), desc(organizationsTable.createdAt))
    .limit(36);

  return {
    organizations,
    stats: {
      total: organizations.length,
      verified: organizations.filter((organization) => organization.verificationStatus === "verified").length,
    },
  };
}

export async function getPublicOrganizationBySlug(slug: string, userId?: string) {
  return getOrganizationBySlug(slug, userId);
}

export async function createOrganization(user: AuthUser, formData: FormData) {
  const input = organizationCreateSchema.parse({
    careerPageUrl: getText(formData.get("careerPageUrl")),
    city: getText(formData.get("city")),
    country: getText(formData.get("country")),
    coverUrl: getText(formData.get("coverUrl")),
    description: getText(formData.get("description")),
    foundedYear: getText(formData.get("foundedYear")),
    headquarters: getText(formData.get("headquarters")),
    industry: getText(formData.get("industry")),
    logoUrl: getText(formData.get("logoUrl")),
    name: getText(formData.get("name")),
    phone: getText(formData.get("phone")),
    postalCode: getText(formData.get("postalCode")),
    primaryEmail: getText(formData.get("primaryEmail")),
    professionalCategories: getText(formData.get("professionalCategories")),
    publicPhone: getBoolean(formData, "publicPhone"),
    services: getText(formData.get("services")),
    size: getText(formData.get("size")),
    slug: getText(formData.get("slug")) || toSlug(getText(formData.get("name"))),
    socialLinks: getText(formData.get("socialLinks")),
    specialties: getText(formData.get("specialties")),
    state: getText(formData.get("state")),
    tagline: getText(formData.get("tagline")),
    technologies: getText(formData.get("technologies")),
    type: getText(formData.get("type")),
    website: getText(formData.get("website")),
  });

  let organization: Organization | undefined;

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const slug = attempt === 1 ? input.slug : slugWithSuffix(input.slug, attempt);

    try {
      [organization] = await db
        .insert(organizationsTable)
        .values({
          careerPageUrl: input.careerPageUrl,
          city: input.city,
          country: input.country,
          coverUrl: input.coverUrl,
          createdBy: user.id,
          description: input.description,
          foundedYear: input.foundedYear,
          headquarters: input.headquarters,
          industry: input.industry,
          logoUrl: input.logoUrl,
          name: input.name,
          phone: input.phone,
          postalCode: input.postalCode,
          primaryEmail: input.primaryEmail,
          professionalCategories: input.professionalCategories,
          publicPhone: input.publicPhone,
          services: input.services,
          size: input.size,
          slug,
          socialLinks: input.socialLinks,
          specialties: input.specialties,
          state: input.state,
          tagline: input.tagline,
          technologies: input.technologies,
          type: input.type,
          website: input.website,
        })
        .returning();
      break;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 8) {
        throw error;
      }
    }
  }

  if (!organization) {
    throw new Error("Organization could not be created.");
  }

  const [logoUrl, coverUrl] = await Promise.all([
    uploadOrganizationMedia(organization.id, "logo", getFile(formData, "logo")),
    uploadOrganizationMedia(organization.id, "cover", getFile(formData, "cover")),
  ]);

  if (logoUrl || coverUrl) {
    [organization] = await db
      .update(organizationsTable)
      .set({
        coverUrl: coverUrl ?? organization.coverUrl,
        logoUrl: logoUrl ?? organization.logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(organizationsTable.id, organization.id))
      .returning();
  }

  const roles = await ensureOrganizationRoles(organization.id);
  const [member] = await db
    .insert(organizationMembersTable)
    .values({
      jobTitle: "Founder / Owner",
      joinedAt: new Date(),
      membershipType: "creator",
      organizationId: organization.id,
      publicVisibility: true,
      status: "active",
      userId: user.id,
    })
    .returning();
  const ownerRole = roles.find((role) => role.key === "OWNER");

  if (ownerRole) {
    await db.insert(organizationMemberRolesTable).values({ assignedBy: user.id, memberId: member.id, roleId: ownerRole.id }).onConflictDoNothing();
  }

  await auditOrganizationAction({
    action: "organization.created",
    actorId: user.id,
    metadata: { slug: organization.slug, type: organization.type },
    organizationId: organization.id,
    targetId: organization.id,
    targetType: "organization",
  });

  return organization;
}

export async function createOrganizationAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const organization = await createOrganization(user, formData);

  revalidatePath("/dashboard/organizations");
  redirect(`/dashboard/organizations/${organization.slug}?onboarding=1`);
}

export async function updateOrganizationOnboardingAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const organizationId = getText(formData.get("organizationId"));

  await requireOrganizationPermission(organizationId, user.id, "organization.update");

  const input = organizationOnboardingSchema.parse({
    careerPageUrl: getText(formData.get("careerPageUrl")),
    city: getText(formData.get("city")),
    country: getText(formData.get("country")),
    coverUrl: getText(formData.get("coverUrl")),
    description: getText(formData.get("description")),
    foundedYear: getText(formData.get("foundedYear")),
    headquarters: getText(formData.get("headquarters")),
    industry: getText(formData.get("industry")),
    logoUrl: getText(formData.get("logoUrl")),
    name: getText(formData.get("name")),
    onboardingStep: getText(formData.get("onboardingStep")),
    phone: getText(formData.get("phone")),
    postalCode: getText(formData.get("postalCode")),
    primaryEmail: getText(formData.get("primaryEmail")),
    professionalCategories: getText(formData.get("professionalCategories")),
    publicPhone: getBoolean(formData, "publicPhone"),
    services: getText(formData.get("services")),
    size: getText(formData.get("size")),
    slug: getText(formData.get("slug")),
    socialLinks: getText(formData.get("socialLinks")),
    specialties: getText(formData.get("specialties")),
    state: getText(formData.get("state")),
    tagline: getText(formData.get("tagline")),
    technologies: getText(formData.get("technologies")),
    type: getText(formData.get("type")),
    website: getText(formData.get("website")),
  });

  await assertSlugAvailable(input.slug, organizationId);

  await db
    .update(organizationsTable)
    .set({
      ...input,
      onboardingCompleted: input.onboardingStep >= 6,
      status: input.onboardingStep >= 6 ? "under_review" : "draft",
      updatedAt: new Date(),
      verificationStatus: input.onboardingStep >= 6 ? "manual_review" : "not_started",
    })
    .where(eq(organizationsTable.id, organizationId));

  await auditOrganizationAction({
    action: "organization.onboarding_updated",
    actorId: user.id,
    metadata: { onboardingStep: input.onboardingStep },
    organizationId,
    targetId: organizationId,
    targetType: "organization",
  });

  revalidatePath("/dashboard/organizations");
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function toggleOrganizationFollowAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationFollowSchema.parse({
    organizationId: getText(formData.get("organizationId")),
    preference: getText(formData.get("preference")) || "important_updates",
  });
  const [existing] = await db
    .select({ id: organizationFollowsTable.id })
    .from(organizationFollowsTable)
    .where(and(eq(organizationFollowsTable.organizationId, input.organizationId), eq(organizationFollowsTable.userId, user.id)))
    .limit(1);

  if (existing) {
    await db.delete(organizationFollowsTable).where(eq(organizationFollowsTable.id, existing.id));
  } else {
    await db.insert(organizationFollowsTable).values({ organizationId: input.organizationId, preference: input.preference, userId: user.id }).onConflictDoNothing();
  }

  await auditOrganizationAction({
    action: existing ? "organization.unfollowed" : "organization.followed",
    actorId: user.id,
    organizationId: input.organizationId,
    targetId: user.id,
    targetType: "user",
  });

  revalidatePath("/dashboard/organizations");
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function requestOrganizationMembershipAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationMembershipRequestSchema.parse({
    jobTitle: getText(formData.get("jobTitle")),
    membershipType: getText(formData.get("membershipType")),
    organizationId: getText(formData.get("organizationId")),
    publicVisibility: getBoolean(formData, "publicVisibility"),
  });

  await db
    .insert(organizationMembersTable)
    .values({
      jobTitle: input.jobTitle,
      membershipType: input.membershipType,
      organizationId: input.organizationId,
      publicVisibility: input.publicVisibility,
      status: "requested",
      userId: user.id,
    })
    .onConflictDoNothing();

  await auditOrganizationAction({
    action: "member.join_requested",
    actorId: user.id,
    organizationId: input.organizationId,
    targetId: user.id,
    targetType: "user",
  });

  revalidatePath("/dashboard/organizations");
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function inviteOrganizationMemberAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationInviteSchema.parse({
    jobTitle: getText(formData.get("jobTitle")),
    organizationId: getText(formData.get("organizationId")),
    roleKey: getText(formData.get("roleKey")) || "MEMBER",
    userId: getText(formData.get("userId")),
  });

  await requireOrganizationPermission(input.organizationId, user.id, "member.invite");
  const roles = await ensureOrganizationRoles(input.organizationId);
  const role = roles.find((item) => item.key === input.roleKey);
  const [member] = await db
    .insert(organizationMembersTable)
    .values({
      invitedBy: user.id,
      jobTitle: input.jobTitle,
      organizationId: input.organizationId,
      status: "invited",
      userId: input.userId,
    })
    .onConflictDoNothing()
    .returning();

  if (member && role) {
    await db.insert(organizationMemberRolesTable).values({ assignedBy: user.id, memberId: member.id, roleId: role.id }).onConflictDoNothing();
  }

  await auditOrganizationAction({
    action: "member.invited",
    actorId: user.id,
    metadata: { roleKey: input.roleKey },
    organizationId: input.organizationId,
    targetId: input.userId,
    targetType: "user",
  });

  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function createDepartmentAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationDepartmentSchema.parse({
    description: getText(formData.get("description")),
    isPublic: getBoolean(formData, "isPublic"),
    name: getText(formData.get("name")),
    organizationId: getText(formData.get("organizationId")),
    parentDepartmentId: getText(formData.get("parentDepartmentId")) || null,
  });

  await requireOrganizationPermission(input.organizationId, user.id, "organization.update");
  const [department] = await db.insert(organizationDepartmentsTable).values(input).returning();
  await auditOrganizationAction({ action: "department.created", actorId: user.id, organizationId: input.organizationId, targetId: department.id, targetType: "department" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function createTeamAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationTeamSchema.parse({
    departmentId: getText(formData.get("departmentId")) || null,
    description: getText(formData.get("description")),
    name: getText(formData.get("name")),
    organizationId: getText(formData.get("organizationId")),
  });

  await requireOrganizationPermission(input.organizationId, user.id, "organization.update");
  const [team] = await db.insert(organizationTeamsTable).values(input).returning();
  await auditOrganizationAction({ action: "team.created", actorId: user.id, organizationId: input.organizationId, targetId: team.id, targetType: "team" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function createOrganizationPostAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationPostSchema.parse({
    body: getText(formData.get("body")),
    organizationId: getText(formData.get("organizationId")),
    status: getText(formData.get("status")) || "draft",
    title: getText(formData.get("title")),
    type: getText(formData.get("type")) || "text",
  });

  await requireOrganizationPermission(input.organizationId, user.id, "post.create");
  const [post] = await db
    .insert(organizationPostsTable)
    .values({ ...input, authorId: user.id, publishedAt: input.status === "published" ? new Date() : null })
    .returning();
  await auditOrganizationAction({ action: "post.created", actorId: user.id, metadata: { status: input.status, type: input.type }, organizationId: input.organizationId, targetId: post.id, targetType: "post" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
  revalidatePath("/home");
}

export async function createProofVerificationRequestAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = proofVerificationRequestSchema.parse({
    evidence: getText(formData.get("evidence")),
    organizationId: getText(formData.get("organizationId")),
    proofId: getText(formData.get("proofId")) || null,
    requestMessage: getText(formData.get("requestMessage")),
  });
  const [request] = await db
    .insert(proofVerificationRequestsTable)
    .values({
      evidence: input.evidence,
      organizationId: input.organizationId,
      proofId: input.proofId,
      requestMessage: input.requestMessage,
      status: "submitted",
      userId: user.id,
    })
    .returning();

  await db.insert(proofVerificationEventsTable).values({
    actorId: user.id,
    decision: "submitted",
    metadata: { evidenceCount: input.evidence.length },
    organizationId: input.organizationId,
    requestId: request.id,
  });
  await auditOrganizationAction({ action: "proof_verification.submitted", actorId: user.id, organizationId: input.organizationId, targetId: request.id, targetType: "proof_verification_request" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function decideProofVerificationAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = proofVerificationDecisionSchema.parse({
    decision: getText(formData.get("decision")),
    publicVerificationNote: getText(formData.get("publicVerificationNote")),
    reason: getText(formData.get("reason")),
    requestId: getText(formData.get("requestId")),
  });
  const [request] = await db.select().from(proofVerificationRequestsTable).where(eq(proofVerificationRequestsTable.id, input.requestId)).limit(1);

  if (!request) {
    throw new Error("Proof verification request was not found.");
  }

  const permission = input.decision === "verified" ? "proof.verify" : input.decision === "rejected" ? "proof.reject" : "proof.review";
  await requireOrganizationPermission(request.organizationId, user.id, permission);

  await db
    .update(proofVerificationRequestsTable)
    .set({
      decidedAt: ["verified", "rejected", "revoked", "expired"].includes(input.decision) ? new Date() : null,
      publicVerificationNote: input.publicVerificationNote,
      status: input.decision,
      updatedAt: new Date(),
      version: request.version + 1,
    })
    .where(eq(proofVerificationRequestsTable.id, input.requestId));
  await db.insert(proofVerificationEventsTable).values({
    actorId: user.id,
    decision: input.decision === "under_review" ? "review_started" : input.decision,
    reason: input.reason,
    organizationId: request.organizationId,
    requestId: request.id,
  });
  await auditOrganizationAction({ action: `proof_verification.${input.decision}`, actorId: user.id, metadata: { reason: input.reason }, organizationId: request.organizationId, targetId: request.id, targetType: "proof_verification_request" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function createOrganizationJobAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = organizationJobSchema.parse({
    applicationDeadline: getText(formData.get("applicationDeadline")),
    departmentId: getText(formData.get("departmentId")) || null,
    description: getText(formData.get("description")),
    employmentType: getText(formData.get("employmentType")) || "full_time",
    experienceLevel: getText(formData.get("experienceLevel")),
    location: getText(formData.get("location")),
    organizationId: getText(formData.get("organizationId")),
    remotePolicy: getText(formData.get("remotePolicy")) || "onsite",
    requirements: getText(formData.get("requirements")),
    responsibilities: getText(formData.get("responsibilities")),
    salaryRange: getText(formData.get("salaryRange")),
    salaryVisible: getBoolean(formData, "salaryVisible"),
    skills: getText(formData.get("skills")),
    status: getText(formData.get("status")) || "draft",
    title: getText(formData.get("title")),
  });

  await requireOrganizationPermission(input.organizationId, user.id, "job.create");
  const [job] = await db
    .insert(organizationJobsTable)
    .values({ ...input, createdBy: user.id, publishedAt: input.status === "published" ? new Date() : null })
    .returning();
  await auditOrganizationAction({ action: "job.created", actorId: user.id, metadata: { status: input.status }, organizationId: input.organizationId, targetId: job.id, targetType: "job" });
  revalidatePath("/dashboard/organizations/[slug]", "page");
  revalidatePath("/home");
}

export async function addCandidateToPipelineAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const input = candidatePipelineSchema.parse({
    candidateId: getText(formData.get("candidateId")),
    internalNote: getText(formData.get("internalNote")),
    organizationId: getText(formData.get("organizationId")),
    stage: getText(formData.get("stage")) || "sourced",
  });

  await requireOrganizationPermission(input.organizationId, user.id, "candidate.pipeline.manage");
  const [pipeline] = await db
    .insert(organizationCandidatePipelineTable)
    .values({
      candidateId: input.candidateId,
      createdBy: user.id,
      internalNote: input.internalNote,
      organizationId: input.organizationId,
      stage: input.stage,
    })
    .onConflictDoNothing()
    .returning();

  if (pipeline) {
    await db.insert(organizationCandidateStageHistoryTable).values({ actorId: user.id, note: input.internalNote, pipelineId: pipeline.id, toStage: input.stage });
    await auditOrganizationAction({ action: "candidate.pipeline_added", actorId: user.id, metadata: { stage: input.stage }, organizationId: input.organizationId, targetId: input.candidateId, targetType: "user" });
  }

  revalidatePath("/dashboard/organizations/[slug]", "page");
}

export async function searchOrganizationTalent(organizationId: string, userId: string, rawQuery: string) {
  await requireOrganizationPermission(organizationId, userId, "candidate.search");
  const input = talentSearchSchema.parse({ query: rawQuery });
  const pattern = `%${input.query.toLowerCase()}%`;
  const rows = await db
    .select({ email: usersTable.email, id: usersTable.id, metadata: usersTable.metadata })
    .from(usersTable)
    .where(sql`lower(${usersTable.email} || ' ' || coalesce(${usersTable.metadata}->>'firstName', '') || ' ' || coalesce(${usersTable.metadata}->>'lastName', '') || ' ' || coalesce(${usersTable.metadata}->>'headline', '') || ' ' || coalesce(${usersTable.metadata}->>'majorSkill', '')) like ${pattern}`)
    .limit(12);

  return rows.map((row) => {
    const profile = getDashboardProfile({ email: row.email, id: row.id, user_metadata: row.metadata });

    return {
      headline: profile.headline,
      id: row.id,
      location: profile.showLocation ? profile.location : null,
      name: profile.displayName,
      skills: profile.skills.slice(0, 6),
    };
  });
}

export function getOrganizationTrustSignals(organization: Organization, data: { memberCount: number; proofRequestCount: number; verifiedProofCount: number }) {
  return [
    { label: "Identity", value: organization.verificationStatus === "verified" ? "Verified" : "In review" },
    { label: "Members", value: `${data.memberCount} active` },
    { label: "Proof activity", value: `${data.verifiedProofCount}/${data.proofRequestCount} verified` },
    { label: "Age on ProofX", value: new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round((organization.createdAt.getTime() - Date.now()) / 86400000), "day") },
  ];
}
