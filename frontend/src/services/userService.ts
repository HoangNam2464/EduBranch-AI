/**
 * EduBranch AI — User Service
 * Account profile of the signed-in user (backend `UserController`, prefix /users).
 * Implements GET /users/me and PATCH /users/me (BE-031 / FE-030).
 */

import apiClient from "@/services/apiClient";
import { toUserProfile, type UserProfile, type UserProfileRow } from "@/services/mappers/user";

type Envelope<T> = { status: string; data: T };

export interface UpdateProfilePayload {
  fullName?: string;
  language?: "vi" | "en";
}

export const userService = {
  /** Profile of the signed-in user (`GET /users/me`, any authenticated role). */
  async getMyProfile(): Promise<UserProfile> {
    const res = await apiClient.get<Envelope<UserProfileRow>>("/users/me");
    return toUserProfile(res.data.data);
  },

  /** Update profile of the signed-in user (`PATCH /users/me`, BE-031 / FE-030). */
  async updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const res = await apiClient.patch<Envelope<UserProfileRow>>("/users/me", payload);
    return toUserProfile(res.data.data);
  },
};
