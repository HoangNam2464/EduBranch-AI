/**
 * EduBranch AI — API client configuration.
 *
 * The frontend only talks to the NestJS Backend Gateway, never to the AI
 * service directly. Only public, frontend-safe values belong here.
 */

export const API_CONFIG = {
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 30_000,
} as const;
