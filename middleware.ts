import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOW_HEADERS =
  "Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
const ALLOW_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const EXPOSE_HEADERS = "Content-Length, Content-Type";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const list = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  let allowOrigin = "*";
  if (list.length) {
    if (origin && list.includes(origin)) allowOrigin = origin;
    else allowOrigin = list[0];
  } else if (origin) {
    allowOrigin = origin;
  }
  if (allowOrigin === "*" && req.headers.get("authorization")) {
    // Cannot use * with credentials; fall back to origin
    allowOrigin = origin || "";
  }
  const headers = new Headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Origin": allowOrigin || "*",
    "Access-Control-Allow-Methods": ALLOW_METHODS,
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Expose-Headers": EXPOSE_HEADERS,
    Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  });
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }
  const res = NextResponse.next();
  headers.forEach((v, k) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
