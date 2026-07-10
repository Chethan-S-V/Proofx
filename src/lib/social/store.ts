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

type SocialState = {
  connections: Record<string, ConnectionState>;
  createdPosts: Array<{ id: string; text: string; type: string }>;
  following: Record<string, boolean>;
  notifications: SocialNotification[];
  addCreatedPost: (post: { text: string; type: string }) => void;
  acceptRequest: (userId: string) => void;
  blockUser: (userId: string) => void;
  declineRequest: (userId: string) => void;
  dismissNotification: (notificationId: string) => void;
  followUser: (userId: string, fullName: string) => void;
  revokeRequest: (userId: string) => void;
  sendRequest: (userId: string, fullName: string) => void;
  unblockUser: (userId: string) => void;
};

const starterNotifications: SocialNotification[] = [
  { id: "request-demo-user-4", kind: "request", message: "Zoya Marlow wants to connect with you.", userId: "demo-user-4" },
  { id: "accepted-demo-user-7", kind: "accepted", message: "Theo Aster accepted your connection request.", userId: "demo-user-7" },
  { id: "update-proof", kind: "update", message: "Your repository proof received 18 new views." },
];

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      connections: { "demo-user-4": "pending", "demo-user-7": "connected", "demo-user-12": "blocked" },
      createdPosts: [],
      following: {},
      notifications: starterNotifications,
      addCreatedPost: (post) => set((state) => ({ createdPosts: [{ ...post, id: `created-${Date.now()}` }, ...state.createdPosts] })),
      acceptRequest: (userId) => set((state) => ({
        connections: { ...state.connections, [userId]: "connected" },
        notifications: [{ id: `accepted-${userId}`, kind: "accepted", message: "Connection accepted.", userId }, ...state.notifications.filter((item) => item.id !== `request-${userId}` && item.id !== `request-demo-user-4`)],
      })),
      blockUser: (userId) => set((state) => ({ connections: { ...state.connections, [userId]: "blocked" } })),
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
      sendRequest: (userId, fullName) => set((state) => ({
        connections: { ...state.connections, [userId]: "pending" },
        notifications: [
          { id: `pending-${userId}`, kind: "pending", message: `Connection request to ${fullName} is pending.`, userId },
          ...state.notifications.filter((item) => item.id !== `pending-${userId}`),
        ],
      })),
      unblockUser: (userId) => set((state) => ({ connections: { ...state.connections, [userId]: "none" } })),
    }),
    { name: "proofx-social-state", storage: createJSONStorage(() => localStorage) },
  ),
);
