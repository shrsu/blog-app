"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          Blog
        </Link>
        <nav className="flex items-center gap-4">
          {status === "loading" ? (
            <span className="text-muted-foreground text-sm">Loading…</span>
          ) : session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/posts/new"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                New post
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
