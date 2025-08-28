import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    const user = await User.create({
      name,
      email,
      password: hashPassword(password),
    });
    return NextResponse.json({
      id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
