import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getDb from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    const db = await getDb();
    const filter = authorId ? { authorId: new ObjectId(authorId) } : {};
    const cursor = db
      .collection("posts")
      .find(filter)
      .sort({ updatedAt: -1 })
      .limit(100);
    const posts = await cursor.toArray();
    const userIds = [...new Set(posts.map((p) => p.authorId.toString()))];
    const users =
      userIds.length > 0
        ? await db
            .collection("users")
            .find({ _id: { $in: userIds.map((id) => new ObjectId(id)) } })
            .toArray()
        : [];
    const nameBy = Object.fromEntries(
      users.map((u) => [u._id.toString(), u.name ?? u.email])
    );
    const list = posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      excerpt: p.body.slice(0, 160) + (p.body.length > 160 ? "…" : ""),
      authorId: p.authorId.toString(),
      authorName: nameBy[p.authorId.toString()] ?? "Unknown",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    return NextResponse.json(list);
  } catch (e) {
    console.error("Posts list error:", e);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, slug, body: postBody } = body;
    if (!title || !slug || typeof title !== "string" || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }
    const db = await getDb();
    const existing = await db.collection("posts").findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }
    const doc = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      body: typeof postBody === "string" ? postBody : "",
      authorId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("posts").insertOne(doc);
    return NextResponse.json({
      id: result.insertedId.toString(),
      title: doc.title,
      slug: doc.slug,
      body: doc.body,
      authorId: session.user.id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (e) {
    console.error("Post create error:", e);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
