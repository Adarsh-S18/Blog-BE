import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "../lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse | Response>,
  roles?: string[]
) {
  return async (req: AuthenticatedRequest) => {
    try {
      const auth = req.headers.get("authorization");
      if (!auth || !auth.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const token = auth.substring(7);
      const decoded = verifyJwt(token);
      if (roles && !roles.includes((decoded as any).role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      req.user = decoded;
      return handler(req);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  };
}
