"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "../../constants/navigation";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-none border-r border-slate-200 bg-white/90 px-4 py-5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:block">
      <div className="flex h-full flex-col">
        <Link href="/home" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            PX
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-950 dark:text-white">PROOFX</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Trust what users prove</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "text-slate-950 dark:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
                )}
                href={item.href}
                key={item.href}
              >
                {isActive ? (
                  <motion.span
                    className="absolute inset-0 rounded-md bg-slate-100 dark:bg-slate-900"
                    layoutId="sidebar-active"
                    transition={{ duration: 0.2 }}
                  />
                ) : null}
                <item.icon className="relative h-4 w-4" aria-hidden="true" />
                <span className="relative">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          aria-label="Open Wild En Tree"
          className="mt-auto flex flex-col items-center gap-1.5 px-3 pb-4 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          href="/wet"
          rel="noreferrer"
          target="_blank"
        >
          <Image
            alt="WET infinity logo"
            className="h-8 w-16 object-contain opacity-75"
            height={32}
            src="/wet-infinity-logo-white.png"
            width={64}
          />
          <span>Made with WET</span>
        </Link>
      </div>
    </aside>
  );
}
