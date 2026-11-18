/**
 * EduBranch AI — User Service
 * Account profile of the signed-in user (backend `UserController`, prefix /users).
 * Only `GET /users/me` exists; there is no profile update endpoint yet.
 */

import apiClient from "@/services/apiClient";
import { toUserProfile, type UserProfile, type UserProfileRow } from "@/services/mappers/user";

type Envelope<T> = { status: string; data: T };

export const userService = {
  /** Profile of the signed-in user (`GET /users/me`, any authenticated role). */
  async getMyProfile(): Promise<UserProfile> {
    const res = await apiClient.get<Envelope<UserProfileRow>>("/users/me");
    return toUserProfile(res.data.data);
  },
};
