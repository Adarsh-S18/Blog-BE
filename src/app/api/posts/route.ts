import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { getUserFromRequest } from "@/lib/getUserFromRequest";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const q = searchParams.get("q");
  const mine = searchParams.get("mine");
  const filter: any = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (mine) {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    filter.author = authUser.sub;
  }
  const total = await Post.countDocuments(filter);
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .populate("author", "name email");
  return NextResponse.json({ data: posts, page, pageSize, total });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const authUser = getUserFromRequest(req);
    if (!authUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { title, content } = body;
    if (!title || !content)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const user = await User.findById(authUser.sub);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    const post = await Post.create({ title, content, author: user._id });
    return NextResponse.json(post);
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
