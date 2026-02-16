import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import getDb from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = {
      email,
      name: typeof name === "string" ? name.trim() || email.split("@")[0] : email.split("@")[0],
      passwordHash,
      createdAt: new Date(),
    };
    const result = await db.collection("users").insertOne(doc);
    return NextResponse.json({
      ok: true,
      user: { id: result.insertedId.toString(), email: doc.email, name: doc.name },
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
