import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Post } from "@/models/Post";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  await dbConnect();
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const post = await Post.findById(params.id).populate(
      "author",
      "name email"
    );
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await dbConnect();
    const authUser = getUserFromRequest(req);
    if (!authUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const post = await Post.findById(params.id);
    if (!post)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.author.toString() !== authUser.sub && authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    post.title = body.title ?? post.title;
    post.content = body.content ?? post.content;
    await post.save();
    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  await dbConnect();
  const authUser = getUserFromRequest(req);
  if (!authUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const post = await Post.findById(params.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.author.toString() !== authUser.sub && authUser.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await post.deleteOne();
  return NextResponse.json({ success: true });
}
