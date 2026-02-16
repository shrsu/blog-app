# Blog App

A full-stack blog built with **Next.js 16**, **shadcn/ui**, and **MongoDB**. It supports authentication (register, login, logout), and CRUD for posts.

## Stack

- **Next.js 16** (App Router)
- **shadcn/ui** (Tailwind-based components)
- **MongoDB** (database)
- **NextAuth v5** (JWT sessions, credentials provider)

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in:

   - `MONGODB_URI` – MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/atlas))
   - `AUTH_SECRET` – random string for NextAuth (e.g. `openssl rand -base64 32`)
   - `AUTH_URL` – app URL (e.g. `http://localhost:3000` for dev)

3. **Run the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You can register, log in, create and edit posts, and view them on the home page.
