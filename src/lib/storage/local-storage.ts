import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads");

function safePath(storagePath: string) {
  const normalized = storagePath.replace(/\\/g, "/").split("/").filter(Boolean).join("/");
  const absolutePath = path.join(UPLOAD_ROOT, normalized);

  if (!absolutePath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid storage path.");
  }

  return { absolutePath, publicPath: `/uploads/${normalized}` };
}

export async function writeStorageFile(storagePath: string, content: Blob | string) {
  const { absolutePath, publicPath } = safePath(storagePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });

  if (typeof content === "string") {
    await writeFile(absolutePath, content, "utf8");
  } else {
    await writeFile(absolutePath, Buffer.from(await content.arrayBuffer()));
  }

  return publicPath;
}

export async function readStorageText(storagePath: string) {
  const { absolutePath } = safePath(storagePath);

  try {
    return await readFile(absolutePath, "utf8");
  } catch {
    return "";
  }
}

export async function deleteStorageFile(storagePath: string) {
  const { absolutePath } = safePath(storagePath);
  await rm(absolutePath, { force: true });
}
