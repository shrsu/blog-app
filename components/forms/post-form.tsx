"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PostFormProps = {
  postId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialBody?: string;
};

export function PostForm({
  postId,
  initialTitle = "",
  initialSlug = "",
  initialBody = "",
}: PostFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = !!postId;

  function slugFromTitle(title: string) {
    return title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string)?.trim() ?? "";
    const slug = (formData.get("slug") as string)?.trim()?.toLowerCase().replace(/\s+/g, "-") ?? "";
    const body = (formData.get("body") as string) ?? "";
    if (!title || !slug) {
      setError("Title and slug are required.");
      setLoading(false);
      return;
    }
    try {
      if (isEdit) {
        const res = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, slug, body }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to update.");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } else {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, slug, body }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to create.");
          setLoading(false);
          return;
        }
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit post" : "Create post"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update the title, slug, and body."
              : "Add a title and slug (URL-friendly)."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              defaultValue={initialTitle}
              placeholder="My first post"
              required
              disabled={loading}
              onChange={(e) => {
                if (!isEdit && !e.currentTarget.form?.querySelector<HTMLInputElement>("[name=slug]")?.value) {
                  const slugField = e.currentTarget.form?.querySelector<HTMLInputElement>("[name=slug]");
                  if (slugField) slugField.value = slugFromTitle(e.target.value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              defaultValue={initialSlug}
              placeholder="my-first-post"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <textarea
              id="body"
              name="body"
              rows={12}
              defaultValue={initialBody}
              placeholder="Write your post content here…"
              disabled={loading}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[200px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save" : "Create post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
