import type { OrganizationRoleKey } from "../../db";

export const organizationPermissions = [
  "organization.update",
  "organization.delete",
  "organization.settings.manage",
  "member.invite",
  "member.remove",
  "member.role.manage",
  "post.create",
  "post.edit",
  "post.delete",
  "challenge.create",
  "challenge.review",
  "challenge.manage",
  "proof.review",
  "proof.verify",
  "proof.reject",
  "candidate.search",
  "candidate.contact",
  "candidate.pipeline.manage",
  "job.create",
  "job.manage",
  "analytics.view",
  "message.manage",
] as const;

export type OrganizationPermissionKey = (typeof organizationPermissions)[number];

export const rolePermissionMatrix: Record<OrganizationRoleKey, OrganizationPermissionKey[]> = {
  OWNER: [...organizationPermissions],
  ADMIN: organizationPermissions.filter((permission) => permission !== "organization.delete"),
  HR_MANAGER: ["member.invite", "member.remove", "candidate.search", "candidate.contact", "candidate.pipeline.manage", "job.create", "job.manage"],
  RECRUITER: ["candidate.search", "candidate.contact", "candidate.pipeline.manage", "message.manage", "analytics.view"],
  TEAM_MANAGER: ["member.invite", "post.create", "challenge.review", "analytics.view", "message.manage"],
  PROOF_VERIFIER: ["proof.review", "proof.verify", "proof.reject", "analytics.view"],
  CHALLENGE_MANAGER: ["challenge.create", "challenge.review", "challenge.manage", "post.create", "analytics.view"],
  CONTENT_MANAGER: ["post.create", "post.edit", "post.delete", "analytics.view"],
  ANALYST: ["analytics.view"],
  MEMBER: ["post.create"],
};

export function roleHasPermission(role: OrganizationRoleKey, permission: OrganizationPermissionKey) {
  return rolePermissionMatrix[role].includes(permission);
}

export function rolesHavePermission(roles: OrganizationRoleKey[], permission: OrganizationPermissionKey) {
  return roles.some((role) => roleHasPermission(role, permission));
}
