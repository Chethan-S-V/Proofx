import type { RepositoryMemberRole, RepositoryVisibility } from "../../db";

export type RepositoryPermissionAction =
  | "read"
  | "write"
  | "admin"
  | "delete"
  | "manage_members"
  | "manage_settings";

const writeRoles: RepositoryMemberRole[] = ["owner", "maintainer", "contributor"];
const adminRoles: RepositoryMemberRole[] = ["owner", "maintainer"];

type RepositoryPermissionInput = {
  isOwner: boolean;
  memberRole?: RepositoryMemberRole;
  visibility: RepositoryVisibility;
};

export function canAccessRepository(action: RepositoryPermissionAction, input: RepositoryPermissionInput) {
  if (input.isOwner) {
    return true;
  }

  if (action === "read") {
    return input.visibility !== "private" || Boolean(input.memberRole);
  }

  if (action === "write") {
    return input.memberRole ? writeRoles.includes(input.memberRole) : false;
  }

  if (action === "admin" || action === "delete" || action === "manage_members" || action === "manage_settings") {
    return input.memberRole ? adminRoles.includes(input.memberRole) : false;
  }

  return false;
}
