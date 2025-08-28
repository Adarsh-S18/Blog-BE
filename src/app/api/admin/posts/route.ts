import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Post } from "@/models/Post";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";

function requireAdmin(req: Request) {
  const u = getUserFromRequest(req);
  if (!u || u.role !== "admin") return null;
  return u;
}

export async function GET(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const filter: any = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("author", "name email");
  return NextResponse.json({ data: posts, total, page, pageSize });
}

export async function POST(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { title, content, authorId } = body;
  if (!title || !content)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const post = await Post.create({
    title,
    content,
    author: authorId || admin.sub,
  });
  return NextResponse.json(post);
}

export async function PUT(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, title, content } = body;
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (title) post.title = title;
  if (content) post.content = content;
  await post.save();
  return NextResponse.json(post);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
