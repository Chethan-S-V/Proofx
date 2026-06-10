"use client";

import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function AiAssistantButton() {
  return (
    <Button
      className="border-slate-800 bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white"
      type="button"
      variant="outline"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">AI</span>
    </Button>
  );
}
