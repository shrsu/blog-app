import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { PostForm } from "@/components/forms/post-form";

async function getPost(id: string) {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const { id } = await params;
  const post = await getPost(id);
  if (!post || post.authorId !== session.user.id) notFound();
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-semibold mb-6">Edit post</h1>
      <PostForm postId={post.id} initialTitle={post.title} initialSlug={post.slug} initialBody={post.body} />
    </div>
  );
}
