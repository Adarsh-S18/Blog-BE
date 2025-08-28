import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authUser = getUserFromRequest(req);
  if (!authUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findById(authUser.sub).select("name email role");
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const authUser = getUserFromRequest(req);
  if (!authUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { name, password } = body;
  await dbConnect();
  const update: any = {};
  if (name) update.name = name;
  if (password) update.password = hashPassword(password);
  const user = await User.findByIdAndUpdate(authUser.sub, update, {
    new: true,
  }).select("name email role");
  return NextResponse.json(user);
}
