import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

async function getPosts() {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/posts`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground mt-1">
          Read the latest posts.
        </p>
      </div>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No posts yet. Sign in and create one!
            </CardContent>
          </Card>
        ) : (
          posts.map(
            (post: {
              id: string;
              title: string;
              slug: string;
              excerpt: string;
              authorName: string;
              updatedAt: string;
            }) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription>
                      By {post.authorName} ·{" "}
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          )
        )}
      </div>
    </div>
  );
}
