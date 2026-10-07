/**
 * EduBranch AI — Authentication State Store (Zustand + persist)
 *
 * Token is persisted to localStorage so the user stays logged in on page refresh.
 * Only the token and role are persisted — full user profile is fetched on mount.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;

  // Computed helpers
  isLecturer: () => boolean;
  isStudent: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken: refreshToken ?? null }),

      login: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      isLecturer: () => get().user?.role === "LECTURER",
      isStudent: () => get().user?.role === "STUDENT",
    }),
    {
      name: "edubranch-auth",   // localStorage key
      partialize: (state) => ({
        // Only persist token — user profile is re-fetched on mount
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
