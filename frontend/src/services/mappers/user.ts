import type { Role } from "@/types";

/**
 * Wire format of `GET /users/me` (backend/src/modules/user/user.service.ts `getProfile`).
 * Unlike most modules this endpoint already maps the row to camelCase
 * (`id, email, fullName, role, createdAt`); `createdAt` is a JSON timestamp.
 * The mapper keeps pages independent of that wire shape and validates the role.
 */
export interface UserProfileRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

/** Account profile shown on 09.1 / 09.2 (no avatar, phone or bio: the API does not return them). */
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  /** Account creation time = "Ngày tham gia" (ISO string). */
  joinedAt: string;
}

const ROLES: readonly Role[] = ["LECTURER", "STUDENT", "ADMIN"];

export function toUserProfile(row: UserProfileRow): UserProfile {
  const role = ROLES.find((r) => r === row.role);
  if (!role) throw new Error(`Unknown role "${row.role}" in /users/me`);
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    role,
    joinedAt: row.createdAt,
  };
}
