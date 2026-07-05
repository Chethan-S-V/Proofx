import { cn } from "../../lib/utils";

type ProofXLoaderProps = {
  className?: string;
  label?: string;
};

export function ProofXLoader({ className, label = "Loading ProofX" }: ProofXLoaderProps) {
  return (
    <div
      aria-label={label}
      aria-live="polite"
      className={cn(
        "flex min-h-[60vh] w-full items-center justify-center bg-white px-6 py-16 text-slate-950 dark:bg-slate-950 dark:text-white",
        className,
      )}
      role="status"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="proofx-simple-loader" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Loading
        </span>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}
