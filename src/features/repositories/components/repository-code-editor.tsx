"use client";

import Editor from "@monaco-editor/react";
import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../../../components/ui/button";

type RepositoryCodeEditorProps = {
  action: (formData: FormData) => Promise<void>;
  branchId: string;
  content: string;
  fileId?: string;
  path: string;
  repositoryId: string;
};

function getLanguage(path: string) {
  const extension = path.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
    case "mdx":
      return "markdown";
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "sql":
      return "sql";
    default:
      return "plaintext";
  }
}

export function RepositoryCodeEditor({ action, branchId, content, fileId, path, repositoryId }: RepositoryCodeEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [filePath, setFilePath] = useState(path);
  const language = useMemo(() => getLanguage(filePath), [filePath]);

  return (
    <form action={action} className="overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
      <input name="repositoryId" type="hidden" value={repositoryId} />
      <input name="branchId" type="hidden" value={branchId} />
      {fileId ? <input name="fileId" type="hidden" value={fileId} /> : null}
      <input name="content" type="hidden" value={editorContent} />

      <div className="border-b border-[#30363d] bg-[#161b22] p-3">
        <label className="block">
          <span className="sr-only">File path</span>
          <input
            className="h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 font-mono text-sm text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
            name="path"
            onChange={(event) => setFilePath(event.target.value)}
            placeholder="src/index.ts"
            required
            value={filePath}
          />
        </label>
      </div>

      <Editor
        height="28rem"
        language={language}
        onChange={(value) => setEditorContent(value ?? "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
        theme="vs-dark"
        value={editorContent}
      />

      <div className="border-t border-[#30363d] bg-[#161b22] p-4">
        <h3 className="text-sm font-semibold text-[#f0f6fc]">Commit changes</h3>
        <p className="mt-1 text-sm text-[#8b949e]">
          Save this file by creating a commit on the selected branch.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="sr-only">Commit message</span>
            <input
              className="h-10 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 text-sm text-[#f0f6fc] outline-none focus:border-[#58a6ff]"
              name="message"
              placeholder={fileId ? `Update ${filePath}` : `Create ${filePath}`}
            />
          </label>
          <Button className="min-w-40 !bg-[#238636] !text-white hover:!bg-[#2ea043] focus-visible:ring-[#238636]/30 dark:!bg-[#238636] dark:!text-white dark:hover:!bg-[#2ea043]" type="submit">
            <Save className="h-4 w-4" aria-hidden="true" />
            Commit changes
          </Button>
        </div>
      </div>
    </form>
  );
}
