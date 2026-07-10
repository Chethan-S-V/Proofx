"use client";

import { Send, Share2 } from "lucide-react";
import { useState } from "react";
import { SharePostDialog } from "../home/share-post-dialog";

export function ProofShareButton({ proofId }: { proofId: string }) {
  const [open, setOpen] = useState(false);
  const [posted, setPosted] = useState(false);
  return <div className="flex gap-2"><button className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-300" onClick={() => setOpen(true)} type="button"><Share2 className="h-3 w-3" />Share</button><button className="flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[11px] text-cyan-300" onClick={() => setPosted(true)} type="button"><Send className="h-3 w-3" />{posted ? "Added" : "Add to post"}</button>{open ? <SharePostDialog onClose={() => setOpen(false)} onShared={() => setOpen(false)} postId={proofId} /> : null}</div>;
}
