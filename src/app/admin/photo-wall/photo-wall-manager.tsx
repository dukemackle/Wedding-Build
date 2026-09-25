"use client";

import { useState, useTransition } from "react";
import { deleteGuestPostAsAdmin, hideGuestPost } from "./actions";
import type { GuestPost, GuestPostStatus } from "@/lib/supabase/types";

type Couple = { name: string; slug: string | null };

const STATUS_STYLE: Record<GuestPostStatus, string> = {
  pending: "border-brass bg-brass/10 text-brass",
  approved: "border-forest bg-forest/10 text-forest",
  hidden: "border-hairline text-ink/50",
};

const FILTERS: { value: GuestPostStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Shown" },
  { value: "hidden", label: "Hidden" },
];

function PostCard({ post, couple }: { post: GuestPost; couple: Couple | undefined }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (formData: FormData) => Promise<{ error?: string }>) {
    const formData = new FormData();
    formData.set("post_id", post.id);
    startTransition(async () => {
      const result = await action(formData);
      setError(result.error ?? null);
    });
  }

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-card shadow-sm">
      {post.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.photo_url} alt="" className="aspect-square w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-ink">{post.name}</span>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono-numbers text-[11px] ${STATUS_STYLE[post.status]}`}
          >
            {post.status === "approved" ? "shown" : post.status}
          </span>
        </div>
        {post.message && <p className="text-sm text-ink/80">{post.message}</p>}
        <p className="mt-auto text-xs text-ink/50">
          {couple?.slug ? (
            <a
              href={`/w/${couple.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-brass hover:underline"
            >
              {couple.name}
            </a>
          ) : (
            (couple?.name ?? "Unknown wedding")
          )}{" "}
          · {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
        </p>
        <div className="flex gap-3 pt-1">
          {post.status !== "hidden" && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(hideGuestPost)}
              className="font-mono-numbers text-xs text-ink/70 hover:text-forest disabled:opacity-50"
            >
              Hide
            </button>
          )}
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (confirm("Delete this post and its photo for good?")) run(deleteGuestPostAsAdmin);
            }}
            className="font-mono-numbers text-xs text-red-800 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        {error && <p className="text-xs text-red-800">{error}</p>}
      </div>
    </li>
  );
}

export function PhotoWallManager({
  posts,
  coupleByWeddingId,
}: {
  posts: GuestPost[];
  coupleByWeddingId: Record<string, Couple>;
}) {
  const [filter, setFilter] = useState<GuestPostStatus | "all">("all");
  const visible = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.value === "all" ? posts.length : posts.filter((p) => p.status === f.value).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 font-mono-numbers text-xs ${
                filter === f.value ? "border-forest bg-forest text-parchment" : "border-hairline text-ink/70"
              }`}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-ink/50">Nothing here.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} couple={coupleByWeddingId[post.wedding_id]} />
          ))}
        </ul>
      )}
    </div>
  );
}
