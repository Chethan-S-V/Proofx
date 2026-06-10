"use client";

import Link from "next/link";
import { LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UserMenuProps = {
  avatarUrl: string | null;
  logoutAction: () => Promise<void>;
  userName: string;
};

export function UserMenu({ avatarUrl, logoutAction, userName }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = userName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open user menu"
        className="flex h-10 cursor-pointer items-center rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-cyan-400/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={userName} className="h-full w-full rounded-md object-cover" src={avatarUrl} />
          ) : (
            initials
          )}
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-12 z-40 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
          role="menu"
        >
          <Link
            className="flex items-center gap-3 border-b border-slate-100 px-3 py-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={userName} className="h-full w-full rounded-md object-cover" src={avatarUrl} />
              ) : (
                <UserRound className="h-4 w-4" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{userName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Open profile page</p>
            </div>
          </Link>
          <div className="py-2">
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              href="/dashboard/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              Profile
            </Link>
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </div>
          <form action={logoutAction}>
            <button
              className="flex w-full items-center gap-3 rounded-md border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              role="menuitem"
              type="submit"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
