import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword, signJwt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    if (!comparePassword(password, user.password))
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    const token = signJwt({
      _id: user._id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
