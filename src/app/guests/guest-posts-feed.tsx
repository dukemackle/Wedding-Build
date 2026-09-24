"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { GuestPost, GuestPostStatus } from "@/lib/supabase/types";
import { deleteGuestPost, setGuestPostStatus } from "./guest-site-actions";

function PostRow({ post }: { post: GuestPost }) {
  const [status, setStatus] = useState<GuestPostStatus>(post.status);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  function update(next: "approved" | "hidden") {
    const formData = new FormData();
    formData.set("id", post.id);
    formData.set("status", next);
    startTransition(async () => {
      const result = await setGuestPostStatus(formData);
      if (result?.error) setError(result.error);
      else setStatus(next);
    });
  }

  function remove() {
    if (!confirm("Delete this post for good?")) return;
    const formData = new FormData();
    formData.set("id", post.id);
    startTransition(async () => {
      const result = await deleteGuestPost(formData);
      if (result?.error) setError(result.error);
      else setDeleted(true);
    });
  }

  if (deleted) return null;

  return (
    <div className="flex flex-col gap-3 border-b border-hairline py-4 last:border-b-0 sm:flex-row sm:gap-4">
      {post.photo_url && (
        <a href={post.photo_url} target="_blank" rel="noreferrer" className="shrink-0">
          <Image
            src={post.photo_url}
            alt={post.name}
            width={240}
            height={240}
            className="aspect-square w-full rounded-lg border border-hairline object-cover sm:h-24 sm:w-24"
          />
        </a>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink">{post.name}</span>
          {status === "pending" && (
            <span className="rounded-full border border-brass/40 bg-brass/10 px-2 py-0.5 text-xs text-brass">
              Waiting for you
            </span>
          )}
          {status === "hidden" && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/50">
              Hidden from site
            </span>
          )}
        </div>
        {post.message && <p className="mt-1 text-sm text-ink/80">{post.message}</p>}
        {error && <p className="mt-1 text-sm text-red-800">{error}</p>}
      </div>
      <div className="flex shrink-0 items-start gap-3 text-sm">
        {status !== "approved" ? (
          <button
            type="button"
            onClick={() => update("approved")}
            disabled={isPending}
            className="rounded-md bg-forest px-3 py-1.5 font-medium text-parchment hover:bg-forest/90 disabled:opacity-60"
          >
            {status === "pending" ? "Approve" : "Show on site"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => update("hidden")}
            disabled={isPending}
            className="py-1.5 text-brass hover:underline disabled:opacity-60"
          >
            Hide from site
          </button>
        )}
        <button
          type="button"
          onClick={remove}
          disabled={isPending}
          className="py-1.5 text-ink/50 hover:underline disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/**
 * Posts to the photo wall, waiting ones first.
 *
 * Nothing a guest posts is public until it's approved here -- the site is
 * shared well past the guest list, and anyone with the link can post.
 */
export function GuestPostsFeed({ posts }: { posts: GuestPost[] }) {
  const ordered = [...posts].sort((a, b) => {
    if ((a.status === "pending") !== (b.status === "pending")) {
      return a.status === "pending" ? -1 : 1;
    }
    return b.created_at.localeCompare(a.created_at);
  });

  return (
    <div>
      {ordered.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </div>
  );
}
