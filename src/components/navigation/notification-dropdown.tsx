"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Building2, FolderGit2, ShieldCheck, Trophy, UserPlus, UserSearch } from "lucide-react";
import { DEMO_MODE_ENABLED, demoNotifications } from "../../demo/home/data";
import { Button } from "../ui/button";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button className="relative" onClick={() => setOpen((current) => !current)} size="icon" variant="outline" aria-label="Open notifications">
        <Bell className="h-4 w-4" aria-hidden="true" />
        {DEMO_MODE_ENABLED ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-300" /> : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute right-0 top-12 z-40 w-80 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Notifications</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{DEMO_MODE_ENABLED ? "Demo network activity" : "No notifications yet"}</p>
            </div>
            {DEMO_MODE_ENABLED ? (
              <div className="max-h-96 space-y-1 overflow-y-auto">
                {demoNotifications.map((notification) => {
                  const icons = { challenge: Trophy, follow: UserPlus, organization: Building2, proof: ShieldCheck, recruiter: UserSearch, repository: FolderGit2 };
                  const Icon = icons[notification.type];
                  return (
                    <button className={`flex w-full gap-3 rounded-md p-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-900 ${notification.unread ? "bg-cyan-50/70 dark:bg-cyan-400/5" : ""}`} key={notification.id} type="button">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Icon className="h-4 w-4" /></span>
                      <span><span className="block text-xs leading-5 text-slate-700 dark:text-slate-200">{notification.message}</span><span className="text-[11px] text-slate-500">{notification.time} ago · Demo</span></span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-1 rounded-md border border-dashed border-slate-200 px-3 py-6 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Proof and organization alerts will appear after real events are recorded.</p>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
