export type Role = "LECTURER" | "STUDENT" | "ADMIN";

export interface JwtPayload {
  sub: string;       // user UUID
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
  };
}
