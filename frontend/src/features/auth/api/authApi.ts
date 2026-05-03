import { http } from "@/lib/http";

export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { token: string; }
export interface RegisterRequest { email: string; password: string; }
export interface RegisterResponse { userId: string; }
export interface PasswordResetRequest { email: string; }
export interface PasswordResetConfirmRequest { userId: string; otp: string; newPassword: string; }

export const authApi = {
  login: (body: LoginRequest) =>
      http.post<LoginResponse>("/auth/login", body),

  register: (body: RegisterRequest) =>
      http.post<RegisterResponse>("/auth/register", body),

  requestPasswordReset: (body: PasswordResetRequest) =>
      http.post<void>("/auth/password-reset/request", body),

  confirmPasswordReset: (body: PasswordResetConfirmRequest) =>
      http.post<void>("/auth/password-reset/confirm", body),
};