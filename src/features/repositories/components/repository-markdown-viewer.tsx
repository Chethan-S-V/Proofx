import { BookOpen } from "lucide-react";
import { Card } from "../../../components/ui/card";

type RepositoryMarkdownViewerProps = {
  markdown: string;
};

function parseInlineMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/.+?)\)/g, '<a href="$2" rel="noreferrer" target="_blank">$1</a>');
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      html.push(inCodeBlock ? "</code></pre>" : "<pre><code>");
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (line.startsWith("# ")) {
      html.push(`<h1>${parseInlineMarkdown(escapeHtml(line.slice(2)))}</h1>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${parseInlineMarkdown(escapeHtml(line.slice(3)))}</h2>`);
    } else if (line.startsWith("### ")) {
      html.push(`<h3>${parseInlineMarkdown(escapeHtml(line.slice(4)))}</h3>`);
    } else if (line.startsWith("- ")) {
      html.push(`<p class="px-list">• ${parseInlineMarkdown(escapeHtml(line.slice(2)))}</p>`);
    } else if (line.trim()) {
      html.push(`<p>${parseInlineMarkdown(escapeHtml(line))}</p>`);
    }
  }

  return html.join("");
}

export function RepositoryMarkdownViewer({ markdown }: RepositoryMarkdownViewerProps) {
  return (
    <Card className="border-[#30363d] bg-[#0d1117] p-5 text-[#f0f6fc]">
      <div className="mb-4 flex items-center gap-2 border-b border-[#30363d] pb-3">
        <BookOpen className="h-4 w-4 text-[#8b949e]" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[#f0f6fc]">README</h2>
      </div>
      {markdown ? (
        <div
          className="prose-repository text-sm leading-7 text-[#c9d1d9]"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
        />
      ) : (
        <p className="text-sm leading-6 text-slate-500">No README has been added yet.</p>
      )}
    </Card>
  );
}
