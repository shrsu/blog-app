import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export interface Post {
  _id: ObjectId;
  title: string;
  slug: string;
  body: string;
  authorId: ObjectId;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PostInsert = Omit<Post, "_id" | "createdAt" | "updatedAt" | "authorName">;
export type PostUpdate = Partial<Pick<Post, "title" | "slug" | "body">>;
