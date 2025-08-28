import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { getUserFromRequest } from "@/lib/getUserFromRequest";

function requireAdmin(req: Request) {
  const u = getUserFromRequest(req);
  if (!u || u.role !== "admin") return null;
  return u;
}

export async function GET(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await User.find().select("name email role createdAt");
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { name, email, password, role } = body;
  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const exists = await User.findOne({ email });
  if (exists)
    return NextResponse.json({ error: "Email in use" }, { status: 400 });
  const user = await User.create({
    name,
    email,
    password: hashPassword(password),
    role: role === "admin" ? "admin" : "user",
  });
  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export async function PUT(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, name, password, role } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const update: any = {};
  if (name) update.name = name;
  if (password) update.password = hashPassword(password);
  if (role) update.role = role === "admin" ? "admin" : "user";
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
    "name email role"
  );
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await user.deleteOne();
  return NextResponse.json({ success: true });
}
