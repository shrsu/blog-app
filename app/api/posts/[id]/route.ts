import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getDb from "@/lib/mongodb";
import { ObjectId } from "mongodb";

function invalidId() {
  return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) return invalidId();
    const db = await getDb();
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const user = await db
      .collection("users")
      .findOne({ _id: post.authorId }, { projection: { name: 1, email: 1 } });
    const authorName = user ? (user.name ?? user.email) : "Unknown";
    return NextResponse.json({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      body: post.body,
      authorId: post.authorId.toString(),
      authorName,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    });
  } catch (e) {
    console.error("Post get error:", e);
    return NextResponse.json(
      { error: "Failed to load post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!ObjectId.isValid(id)) return invalidId();
    const body = await request.json();
    const db = await getDb();
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updates: { title?: string; slug?: string; body?: string; updatedAt: Date } = {
      updatedAt: new Date(),
    };
    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.slug === "string")
      updates.slug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (typeof body.body === "string") updates.body = body.body;
    if (updates.slug && updates.slug !== post.slug) {
      const existing = await db.collection("posts").findOne({ slug: updates.slug });
      if (existing) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 409 }
        );
      }
    }
    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(id) }, { $set: updates });
    const updated = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    return NextResponse.json({
      id: updated!._id.toString(),
      title: updated!.title,
      slug: updated!.slug,
      body: updated!.body,
      authorId: updated!.authorId.toString(),
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    });
  } catch (e) {
    console.error("Post update error:", e);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!ObjectId.isValid(id)) return invalidId();
    const db = await getDb();
    const post = await db.collection("posts").findOne({ _id: new ObjectId(id) });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.authorId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.collection("posts").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Post delete error:", e);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
