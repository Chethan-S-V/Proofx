"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";

type RepositoryUploadPanelProps = {
  action: (formData: FormData) => Promise<void>;
  basePath: string;
  branchId: string;
  repositoryId: string;
};

type UploadItem = {
  file: File;
  path: string;
};

type FileSystemEntryLike = {
  fullPath: string;
  isDirectory: boolean;
  isFile: boolean;
  createReader?: () => { readEntries: (callback: (entries: FileSystemEntryLike[]) => void) => void };
  file?: (callback: (file: File) => void) => void;
};

function getFilePath(file: File) {
  return normalizeUploadPath((file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name);
}

function normalizeUploadPath(path: string) {
  return path
    .replace(/\\/g, "/")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("/");
}

async function readEntry(entry: FileSystemEntryLike): Promise<UploadItem[]> {
  if (entry.isFile && entry.file) {
    const readFile = entry.file;

    return new Promise((resolve) => {
      readFile((file) => {
        resolve([{ file, path: normalizeUploadPath(entry.fullPath || file.name) }]);
      });
    });
  }

  if (!entry.isDirectory || !entry.createReader) {
    return [];
  }

  const reader = entry.createReader();
  const entries = await new Promise<FileSystemEntryLike[]>((resolve) => reader.readEntries(resolve));
  const nestedItems = await Promise.all(entries.map((nestedEntry) => readEntry(nestedEntry)));

  return nestedItems.flat();
}

export function RepositoryUploadPanel({ action, basePath, branchId, repositoryId }: RepositoryUploadPanelProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addItems(nextItems: UploadItem[]) {
    setItems((currentItems) => {
      const existingPaths = new Set(currentItems.map((item) => item.path));
      return [...currentItems, ...nextItems.filter((item) => !existingPaths.has(item.path))];
    });
  }

  function addFiles(files: FileList | File[]) {
    addItems(
      Array.from(files).map((file) => ({
        file,
        path: getFilePath(file),
      }))
    );
  }

  async function addDroppedItems(dataTransfer: DataTransfer) {
    const entries = Array.from(dataTransfer.items)
      .map((item) => {
        const withEntry = item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntryLike | null };
        return (withEntry.webkitGetAsEntry?.() ?? null) as FileSystemEntryLike | null;
      })
      .filter((entry): entry is FileSystemEntryLike => Boolean(entry));

    if (entries.length === 0) {
      addFiles(dataTransfer.files);
      return;
    }

    const droppedItems = await Promise.all(entries.map((entry) => readEntry(entry)));
    addItems(droppedItems.flat());
  }

  function submitUpload() {
    if (items.length === 0 || isPending) {
      return;
    }

    const formData = new FormData();
    formData.set("repositoryId", repositoryId);
    formData.set("branchId", branchId);
    formData.set("basePath", basePath);
    formData.set("message", message);

    items.forEach((item) => {
      formData.append("files", item.file);
      formData.append("paths", item.path);
    });

    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <section className="overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117] text-[#f0f6fc]">
      <div className="border-b border-[#30363d] bg-[#161b22] p-4">
        <h2 className="text-sm font-semibold">Upload files</h2>
        <p className="mt-1 text-sm text-[#8b949e]">Drag and drop files here, or choose files and folders from your computer.</p>
      </div>

      <div
        className={`m-4 flex min-h-48 flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition duration-200 ${
          isDragging ? "border-[#58a6ff] bg-[#58a6ff]/10" : "border-[#30363d] bg-[#010409] hover:border-[#58a6ff]/60"
        }`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void addDroppedItems(event.dataTransfer);
        }}
      >
        <div className={`rounded-full border border-[#30363d] bg-[#161b22] p-3 transition ${isDragging ? "scale-110" : ""}`}>
          <Upload className="h-8 w-8 text-[#8b949e]" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-medium text-[#f0f6fc]">Drop files or folders to upload</p>
        <p className="mt-1 text-sm text-[#8b949e]">Selected files appear below before you commit.</p>
        <button
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-4 text-sm font-medium text-[#f0f6fc] transition hover:-translate-y-0.5 hover:bg-[#30363d]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Browse files
        </button>
        <input className="hidden" multiple onChange={(event) => addFiles(event.target.files ?? [])} ref={fileInputRef} type="file" />
      </div>

      <div className="space-y-3 border-t border-[#30363d] bg-[#161b22] p-4">
        <input
          className="h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Commit message"
          value={message}
        />

        {items.length ? (
          <div className="max-h-48 overflow-auto rounded-md border border-[#30363d] bg-[#0d1117]">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-3 border-b border-[#30363d] px-3 py-2 text-sm transition hover:bg-[#161b22] last:border-0" key={item.path}>
                <span className="truncate font-mono text-[#c9d1d9]">{item.path}</span>
                <button
                  className="text-[#8b949e] hover:text-[#f0f6fc]"
                  onClick={() => setItems((currentItems) => currentItems.filter((currentItem) => currentItem.path !== item.path))}
                  type="button"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Remove {item.path}</span>
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#238636] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#2ea043] disabled:pointer-events-none disabled:opacity-50"
          disabled={items.length === 0 || isPending}
          onClick={submitUpload}
          type="button"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {isPending ? "Uploading..." : "Commit uploaded files"}
        </button>
      </div>
    </section>
  );
}
