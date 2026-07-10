"use client";

import { useSocialStore } from "../../lib/social/store";

type NetworkActionButtonProps = {
  className?: string;
  mode: "connect" | "follow";
  userId?: string;
  userName?: string;
};

export function NetworkActionButton({ className = "", mode, userId = "anonymous", userName = "this user" }: NetworkActionButtonProps) {
  const connectionState = useSocialStore((state) => state.connections[userId] ?? "none");
  const following = useSocialStore((state) => Boolean(state.following[userId]));
  const followUser = useSocialStore((state) => state.followUser);
  const revokeRequest = useSocialStore((state) => state.revokeRequest);
  const sendRequest = useSocialStore((state) => state.sendRequest);
  const isActive = connectionState === "connected";
  const label = mode === "connect" ? connectionState === "pending" ? "Pending" : isActive ? "Connected" : "Connect" : following ? "Following" : "Follow";
  const isPressed = mode === "follow" ? following : isActive;

  return (
    <button
      aria-pressed={isPressed}
      className={`${className} ${isPressed ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : connectionState === "pending" ? "border-amber-400/30 bg-amber-400/10 text-amber-300" : ""}`}
      onClick={() => {
        if (mode === "follow") {
          followUser(userId, userName);
          return;
        }
        if (connectionState === "pending") {
          revokeRequest(userId);
          return;
        }
        sendRequest(userId, userName);
      }}
      type="button"
      title={mode === "connect" && connectionState === "pending" ? "Click to revoke this pending request" : undefined}
    >
      {label}
    </button>
  );
}
