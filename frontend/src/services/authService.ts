/**
 * EduBranch AI — Auth Service
 * Handles login, register, and token management.
 */

import apiClient from "./apiClient";
import { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<{ status: string; data: AuthResponse }>("/auth/login", data);
    return res.data.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<{ status: string; data: AuthResponse }>("/auth/register", data);
    return res.data.data;
  },

  async getMe(): Promise<AuthResponse["user"]> {
    const res = await apiClient.get<{ status: string; data: AuthResponse["user"] }>("/users/me");
    return res.data.data;
  },
};
