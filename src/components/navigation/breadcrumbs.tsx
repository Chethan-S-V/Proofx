"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumbs">
      <Link className="font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" href="/home">
        ProofX
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join("/")}`;
        const isLast = index === segments.length - 2;

        return (
          <span className="flex items-center gap-1" key={href}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {isLast ? (
              <span className="font-medium text-slate-950 dark:text-white">{formatSegment(segment)}</span>
            ) : (
              <Link className="hover:text-slate-950 dark:hover:text-white" href={href}>
                {formatSegment(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
