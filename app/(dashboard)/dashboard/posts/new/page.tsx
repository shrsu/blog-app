import { PostForm } from "@/components/forms/post-form";

export default function NewPostPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-semibold mb-6">New post</h1>
      <PostForm />
    </div>
  );
}
