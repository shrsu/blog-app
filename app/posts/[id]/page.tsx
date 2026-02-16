import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getPost(id: string) {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-block"
      >
        ← Back to posts
      </Link>
      <article>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-muted-foreground mt-2">
          By {post.authorName} · {new Date(post.updatedAt).toLocaleDateString()}
        </p>
        <div className="mt-6 prose prose-neutral dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{post.body}</div>
        </div>
      </article>
    </div>
  );
}
