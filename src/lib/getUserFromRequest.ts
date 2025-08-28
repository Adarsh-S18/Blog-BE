import { verifyJwt } from "@/lib/auth";

export interface AuthUser {
  sub: string;
  email: string;
  role: string;
  name: string;
  [k: string]: any;
}

export function getUserFromRequest(req: Request): AuthUser | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  try {
    return verifyJwt<AuthUser>(token);
  } catch {
    return null;
  }
}
