"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ConnectionState = "none" | "pending" | "connected" | "blocked";
export type SocialNotification = {
  id: string;
  kind: "request" | "pending" | "accepted" | "update";
  message: string;
  userId?: string;
};
export type SavedPost = { id: string; authorId: string; savedAt: string };
export type SharedPostMessage = { id: string; postId: string; recipientId: string; sentAt: string };
export type SiteTheme = "default" | "light";
export type PostActivity = { postId: string; type: "like" | "comment"; createdAt: string; text?: string };

type SocialState = {
  codebaseEnabled: boolean;
  blockedAt: Record<string, string>;
  connections: Record<string, ConnectionState>;
  createdPosts: Array<{ id: string; text: string; type: string }>;
  following: Record<string, boolean>;
  notifications: SocialNotification[];
  premiumPlan: "basic" | "pro" | "pro-plus";
  savedPosts: SavedPost[];
  sharedPostMessages: SharedPostMessage[];
  siteTheme: SiteTheme;
  videoMuted: boolean;
  postActivity: PostActivity[];
  addCreatedPost: (post: { text: string; type: string }) => void;
  acceptRequest: (userId: string) => void;
  blockUser: (userId: string) => void;
  declineRequest: (userId: string) => void;
  dismissNotification: (notificationId: string) => void;
  followUser: (userId: string, fullName: string) => void;
  revokeRequest: (userId: string) => void;
  savePost: (post: { authorId: string; id: string }) => void;
  sendRequest: (userId: string, fullName: string) => void;
  setCodebaseEnabled: (enabled: boolean) => void;
  setPremiumPlan: (plan: "basic" | "pro" | "pro-plus") => void;
  setSiteTheme: (theme: SiteTheme) => void;
  setVideoMuted: (muted: boolean) => void;
  sharePostToUser: (postId: string, recipientId: string) => void;
  unblockUser: (userId: string) => void;
  recordPostActivity: (activity: Omit<PostActivity, "createdAt">) => void;
};

const starterNotifications: SocialNotification[] = [
  { id: "request-demo-user-4", kind: "request", message: "Zoya Marlow wants to connect with you.", userId: "demo-user-4" },
  { id: "accepted-demo-user-7", kind: "accepted", message: "Theo Aster accepted your connection request.", userId: "demo-user-7" },
  { id: "update-proof", kind: "update", message: "Your repository proof received 18 new views." },
];

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      codebaseEnabled: false,
      blockedAt: {},
      connections: { "demo-user-4": "pending", "demo-user-7": "connected", "demo-user-12": "blocked" },
      createdPosts: [],
      following: {},
      notifications: starterNotifications,
      premiumPlan: "basic",
      savedPosts: [],
      sharedPostMessages: [],
      siteTheme: "default",
      videoMuted: true,
      postActivity: [],
      addCreatedPost: (post) => set((state) => ({ createdPosts: [{ ...post, id: `created-${Date.now()}` }, ...state.createdPosts] })),
      acceptRequest: (userId) => set((state) => ({
        connections: { ...state.connections, [userId]: "connected" },
        notifications: [{ id: `accepted-${userId}`, kind: "accepted", message: "Connection accepted.", userId }, ...state.notifications.filter((item) => item.id !== `request-${userId}` && item.id !== `request-demo-user-4`)],
      })),
      blockUser: (userId) => set((state) => ({ blockedAt: { ...state.blockedAt, [userId]: new Date().toISOString() }, connections: { ...state.connections, [userId]: "blocked" } })),
      declineRequest: (userId) => set((state) => ({
        connections: { ...state.connections, [userId]: "none" },
        notifications: state.notifications.filter((item) => item.id !== `request-${userId}` && item.id !== `request-demo-user-4`),
      })),
      dismissNotification: (notificationId) => set((state) => ({ notifications: state.notifications.filter((item) => item.id !== notificationId) })),
      followUser: (userId, fullName) => set((state) => ({
        following: { ...state.following, [userId]: !state.following[userId] },
        notifications: [
          { id: `follow-${userId}-${Date.now()}`, kind: "update", message: state.following[userId] ? `You unfollowed ${fullName}.` : `You are now following ${fullName}.`, userId },
          ...state.notifications,
        ],
      })),
      revokeRequest: (userId) => set((state) => ({
        connections: { ...state.connections, [userId]: "none" },
        notifications: state.notifications.filter((item) => item.id !== `pending-${userId}`),
      })),
      savePost: (post) => set((state) => ({
        savedPosts: state.savedPosts.some((item) => item.id === post.id)
          ? state.savedPosts.filter((item) => item.id !== post.id)
          : [{ ...post, savedAt: new Date().toISOString() }, ...state.savedPosts],
      })),
      sendRequest: (userId, fullName) => set((state) => ({
        connections: { ...state.connections, [userId]: "pending" },
        notifications: [
          { id: `pending-${userId}`, kind: "pending", message: `Connection request to ${fullName} is pending.`, userId },
          ...state.notifications.filter((item) => item.id !== `pending-${userId}`),
        ],
      })),
      setCodebaseEnabled: (enabled) => set({ codebaseEnabled: enabled }),
      setPremiumPlan: (plan) => set({ premiumPlan: plan }),
      setSiteTheme: (theme) => set({ siteTheme: theme }),
      setVideoMuted: (videoMuted) => set({ videoMuted }),
      sharePostToUser: (postId, recipientId) => set((state) => ({
        sharedPostMessages: [{ id: `shared-${postId}-${recipientId}-${Date.now()}`, postId, recipientId, sentAt: new Date().toISOString() }, ...state.sharedPostMessages],
      })),
      unblockUser: (userId) => set((state) => { const { [userId]: _, ...blockedAt } = state.blockedAt; return { blockedAt, connections: { ...state.connections, [userId]: "none" } }; }),
      recordPostActivity: (activity) => set((state) => ({ postActivity: [{ ...activity, createdAt: new Date().toISOString() }, ...state.postActivity.filter((item) => !(activity.type === "like" && item.type === "like" && item.postId === activity.postId))] })),
    }),
    { name: "proofx-social-state", storage: createJSONStorage(() => localStorage) },
  ),
);
