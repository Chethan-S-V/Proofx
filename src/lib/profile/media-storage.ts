import { deleteStorageFile, writeStorageFile } from "../storage/local-storage";

const PROFILE_MEDIA_BUCKET = "profile-media";
const MAX_PROFILE_MEDIA_BYTES = 1_000_000;

type ProfileMediaKind = "avatar" | "banner";

function getProfileMediaPath(userId: string, kind: ProfileMediaKind) {
  return `${userId}/${kind}.jpg`;
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error("Profile media could not be decoded.");
  }

  const blob = await response.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error("Profile media must be an image.");
  }

  if (blob.size > MAX_PROFILE_MEDIA_BYTES) {
    throw new Error("Profile media is too large.");
  }

  return blob;
}

export async function uploadProfileMedia(
  userId: string,
  kind: ProfileMediaKind,
  dataUrl: string,
) {
  const path = `${PROFILE_MEDIA_BUCKET}/${getProfileMediaPath(userId, kind)}`;
  const blob = await dataUrlToBlob(dataUrl);
  const publicUrl = await writeStorageFile(path, blob);
  const versionSeparator = publicUrl.includes("?") ? "&" : "?";

  return `${publicUrl}${versionSeparator}v=${Date.now()}`;
}

export async function deleteProfileMedia(userId: string, kind: ProfileMediaKind) {
  await deleteStorageFile(`${PROFILE_MEDIA_BUCKET}/${getProfileMediaPath(userId, kind)}`);
}
