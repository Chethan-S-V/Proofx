import { writeStorageFile } from "../../lib/storage/local-storage";

const ORGANIZATION_MEDIA_BUCKET = "organization-media";
const MAX_ORGANIZATION_MEDIA_BYTES = 2_000_000;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type OrganizationMediaKind = "cover" | "logo";

function getExtension(type: string) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  if (type === "image/gif") {
    return "gif";
  }

  return "jpg";
}

export async function uploadOrganizationMedia(organizationId: string, kind: OrganizationMediaKind, file: File | null) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Organization media must be a JPG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_ORGANIZATION_MEDIA_BYTES) {
    throw new Error("Organization media must be 2 MB or smaller.");
  }

  const path = `${ORGANIZATION_MEDIA_BUCKET}/${organizationId}/${kind}.${getExtension(file.type)}`;
  const publicUrl = await writeStorageFile(path, file);
  const versionSeparator = publicUrl.includes("?") ? "&" : "?";

  return `${publicUrl}${versionSeparator}v=${Date.now()}`;
}
