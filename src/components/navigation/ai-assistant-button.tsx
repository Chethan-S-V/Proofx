"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  FileCheck2,
  FolderGit2,
  Lightbulb,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const assistantTools = [
  {
    description: "Turn owned work into a clear claim, evidence set, outcome, and review plan.",
    href: "/dashboard/proofs",
    icon: FileCheck2,
    id: "proof-coach",
    label: "Proof coach",
    placeholder: "Describe the work you want to prove...",
    steps: ["Define the contribution you personally owned.", "Attach the strongest repository, document, or outcome evidence.", "Choose visibility and request an appropriate verifier."],
  },
  {
    description: "Find profile areas that need stronger evidence or clearer professional context.",
    href: "/dashboard/profile",
    icon: UserRound,
    id: "profile-review",
    label: "Profile review",
    placeholder: "What role or skill should your profile communicate?",
    steps: ["Clarify the role or capability you want to communicate.", "Match each important claim to an existing proof.", "Fill only the highest-impact evidence gap next."],
  },
  {
    description: "Choose a practical challenge that strengthens a real skill gap.",
    href: "/dashboard/challenges",
    icon: Target,
    id: "challenge-match",
    label: "Challenge matcher",
    placeholder: "Which skill do you want to demonstrate?",
    steps: ["Name the skill and the level you want to demonstrate.", "Select a challenge with transparent evaluation criteria.", "Submit artifacts that can become a verified proof."],
  },
  {
    description: "Identify repository activity that can support a trustworthy proof record.",
    href: "/dashboard/repositories",
    icon: FolderGit2,
    id: "evidence-finder",
    label: "Evidence finder",
    placeholder: "Describe the repository contribution to find...",
    steps: ["Locate the repository and contribution window.", "Separate your commits and decisions from team output.", "Connect the evidence to a proof without exposing private source."],
  },
] as const;

export function AiAssistantButton() {
  const [open, setOpen] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<(typeof assistantTools)[number]["id"]>("proof-coach");
  const [request, setRequest] = useState("");
  const [plan, setPlan] = useState<readonly string[] | null>(null);
  const selectedTool = assistantTools.find((tool) => tool.id === selectedToolId) ?? assistantTools[0];

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  function selectTool(toolId: (typeof assistantTools)[number]["id"]) {
    setSelectedToolId(toolId);
    setPlan(null);
  }

  function buildGuidedPlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (request.trim().length < 3) {
      return;
    }

    setPlan(selectedTool.steps);
  }

  return (
    <>
      <Button
        className="border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">AI</span>
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <button aria-label="Close AI assistant" className="absolute inset-0" onClick={() => setOpen(false)} type="button" />
            <motion.aside
              aria-label="ProofX AI assistant"
              aria-modal="true"
              className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-950 shadow-2xl"
              exit={{ x: "100%" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              role="dialog"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-300">ProofX AI</p>
                    <h2 className="mt-1 text-lg font-semibold text-white">Build stronger, honest professional signals</h2>
                    <p className="mt-1 text-sm text-slate-400">Choose a focused workflow and turn your goal into concrete next steps.</p>
                  </div>
                </div>
                <Button aria-label="Close AI assistant" onClick={() => setOpen(false)} size="icon" variant="ghost">
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </header>

              <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
                <section>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">AI tools</h3>
                    <span className="text-xs text-slate-500">Grounded in your ProofX workflow</span>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {assistantTools.map((tool) => (
                      <button
                        className={`rounded-xl border p-4 text-left transition ${
                          selectedToolId === tool.id
                            ? "border-cyan-400 bg-cyan-400/10"
                            : "border-slate-800 bg-slate-900/45 hover:border-slate-700"
                        }`}
                        key={tool.id}
                        onClick={() => selectTool(tool.id)}
                        type="button"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
                            <tool.icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="text-sm font-semibold text-white">{tool.label}</span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-slate-400">{tool.description}</p>
                      </button>
                    ))}
                  </div>
                </section>

                <form className="rounded-xl border border-slate-800 bg-slate-900/45 p-4" onSubmit={buildGuidedPlan}>
                  <label className="text-sm font-semibold text-white" htmlFor="ai-assistant-request">
                    What would you like help with?
                  </label>
                  <textarea
                    className="mt-3 min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    id="ai-assistant-request"
                    onChange={(event) => {
                      setRequest(event.target.value);
                      setPlan(null);
                    }}
                    placeholder={selectedTool.placeholder}
                    value={request}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">ProofX never treats an unverified claim as proof.</p>
                    <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" disabled={request.trim().length < 3} type="submit">
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Build a plan
                    </Button>
                  </div>
                </form>

                {plan ? (
                  <motion.section
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5"
                    initial={{ opacity: 0, y: 8 }}
                  >
                    <div className="flex items-center gap-2 text-cyan-200">
                      <Lightbulb className="h-4 w-4" aria-hidden="true" />
                      <h3 className="text-sm font-semibold">Recommended plan</h3>
                    </div>
                    <ol className="mt-4 space-y-3">
                      {plan.map((step, index) => (
                        <li className="flex gap-3 text-sm leading-6 text-slate-300" key={step}>
                          <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-cyan-200">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                    <Link
                      className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-white transition hover:border-cyan-400"
                      href={selectedTool.href}
                      onClick={() => setOpen(false)}
                    >
                      Open {selectedTool.label.toLowerCase()}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.section>
                ) : null}

                <section className="flex gap-3 rounded-xl border border-slate-800 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-300" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">Trust guardrails</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Suggestions help organize your work. Verification status, proof scores, and contribution ownership still come from evidence and authorized reviewers.
                    </p>
                  </div>
                </section>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
