"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setOpen((current) => !current)} size="icon" variant="outline" aria-label="Open notifications">
        <Bell className="h-4 w-4" aria-hidden="true" />
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
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">No notifications yet</p>
            </div>
            <div className="mt-1 rounded-md border border-dashed border-slate-200 px-3 py-6 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Proof and organization alerts will appear after real events are recorded.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
