"use client";

import type { ReactNode } from "react";
import { useSocialStore } from "../../lib/social/store";

export function DashboardThemeShell({ children }: { children: ReactNode }) {
  const siteTheme = useSocialStore((state) => state.siteTheme);

  return (
    <div className={siteTheme === "light" ? "min-h-screen bg-slate-100 text-slate-950 proofx-light" : "min-h-screen bg-slate-950 text-white"}>
      {children}
    </div>
  );
}
