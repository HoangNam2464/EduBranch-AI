/**
 * EduBranch AI — Centralized Axios API Client
 *
 * RULE: All API calls go through this client — never call FastAPI directly.
 * RULE: Never store secrets in frontend environment variables.
 */

import axios from "axios";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";
import { API_CONFIG } from "@/config/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401 while signed in: the backend has no refresh endpoint, so the session is over.
    // Flag it instead of signing out silently — the app shell shows the
    // "Phiên đăng nhập đã hết hạn" dialog (Figma 01.6) over the current screen,
    // and "Đăng nhập lại" clears the session and opens the login page.
    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (originalRequest) originalRequest._retry = true;
      useAuthStore.getState().markSessionExpired();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
