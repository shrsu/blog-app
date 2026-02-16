import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostActions } from "@/components/post-actions";

async function getMyPosts(userId: string) {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts?authorId=${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  const posts = await getMyPosts(session.user.id);

  return (
    <div className="container max-w-3xl py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage your posts. You have {posts.length} post{posts.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button>New post</Button>
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No posts yet</CardTitle>
              <CardDescription>
                Create your first post to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/posts/new">
                <Button>New post</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          posts.map((post: { id: string; title: string; slug: string; updatedAt: string }) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/posts/${post.id}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Updated {new Date(post.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <PostActions postId={post.id} />
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
