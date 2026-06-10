"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Command, Search, X } from "lucide-react";
import Link from "next/link";
import { navigationItems } from "../../constants/navigation";
import { Button } from "../ui/button";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button className="hidden min-w-56 justify-start text-slate-500 dark:text-slate-400 md:inline-flex" onClick={() => setOpen(true)} variant="outline">
        <Search className="h-4 w-4" aria-hidden="true" />
        Search workspace
        <span className="ml-auto inline-flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-xs dark:border-slate-700">
          <Command className="h-3 w-3" aria-hidden="true" />K
        </span>
      </Button>
      <Button className="md:hidden" onClick={() => setOpen(true)} size="icon" variant="outline" aria-label="Open command palette">
        <Search className="h-4 w-4" aria-hidden="true" />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/40 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto mt-20 max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <input
                  className="h-9 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                  placeholder="Search navigation..."
                  autoFocus
                />
                <Button onClick={() => setOpen(false)} size="icon" variant="ghost" aria-label="Close command palette">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="p-2">
                {navigationItems.map((item) => (
                  <Link
                    className="flex items-center gap-3 rounded-md px-3 py-3 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-900"
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium text-slate-950 dark:text-white">{item.title}</span>
                    <span className="ml-auto hidden text-xs text-slate-400 sm:inline">{item.description}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
