"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navigationItems } from "../../constants/navigation";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button className="lg:hidden" onClick={() => setOpen(true)} size="icon" variant="outline" aria-label="Open navigation">
        <Menu className="h-4 w-4" aria-hidden="true" />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} type="button" aria-label="Close navigation" />
            <motion.aside
              className="relative flex h-full w-[20rem] max-w-[86vw] flex-col bg-white p-5 shadow-2xl dark:bg-slate-950"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <Link href="/home" className="text-sm font-semibold tracking-[0.18em] text-slate-950 dark:text-white" onClick={() => setOpen(false)}>
                  PROOFX
                </Link>
                <Button onClick={() => setOpen(false)} size="icon" variant="ghost" aria-label="Close navigation">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <nav className="mt-8 space-y-1">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
