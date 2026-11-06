"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { GuestPost, GuestPostStatus, ItineraryEvent } from "@/lib/supabase/types";
import { photoChapters } from "@/lib/photo-chapters";
import { deleteGuestPost, setGuestPostStatus } from "./guest-site-actions";

type Table = { id: string; name: string };

function PostRow({ post, tableName }: { post: GuestPost; tableName?: string }) {
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
          {tableName && (
            <span className="rounded-full border border-hairline px-2 py-0.5 text-xs text-ink/60">
              {tableName}
            </span>
          )}
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
 * Posts to the photo wall: the ones waiting for approval first, then the rest
 * in itinerary chapters (Ceremony, Cocktail hour…) by when each photo was
 * taken (src/lib/photo-chapters.ts). Chapters are the couple's view only; the
 * guest site's wall stays one stream.
 *
 * Nothing a guest posts is public until it's approved here -- the site is
 * shared well past the guest list, and anyone with the link can post.
 */
export function GuestPostsFeed({
  posts,
  events = [],
  tables = [],
}: {
  posts: GuestPost[];
  /** The couple's itinerary, for the chapters. */
  events?: ItineraryEvent[];
  /** Seating tables, for the table tag and which tables haven't posted. */
  tables?: Table[];
}) {
  const tableName = new Map(tables.map((t) => [t.id, t.name]));
  const pending = posts
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const reviewed = posts.filter((p) => p.status !== "pending");
  const chapters = photoChapters(reviewed, events);
  // One chapter called "Other photos" is just the old list with a heading.
  const showChapters = chapters.length > 1 || (chapters[0] && chapters[0].key !== "other");

  const row = (post: GuestPost) => (
    <PostRow
      key={post.id}
      post={post}
      tableName={post.seating_table_id ? tableName.get(post.seating_table_id) : undefined}
    />
  );

  return (
    <div>
      <TableCoverage posts={posts} tables={tables} />
      {pending.length > 0 && (
        <section>
          {reviewed.length > 0 && <ChapterHeading title="Waiting for you" note={`${pending.length} to review`} />}
          {pending.map(row)}
        </section>
      )}
      {showChapters
        ? chapters.map((chapter) => (
            <section key={chapter.key}>
              <ChapterHeading title={chapter.title} note={chapter.when} count={chapter.posts.length} />
              {chapter.posts.map(row)}
            </section>
          ))
        : [...reviewed].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(row)}
    </div>
  );
}

function ChapterHeading({ title, note, count }: { title: string; note?: string | null; count?: number }) {
  return (
    <div className="mt-6 flex flex-col gap-0.5 border-b border-hairline pb-2 first:mt-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <h3 className="font-display text-lg font-medium text-forest">{title}</h3>
      <span className="font-mono-numbers sm:shrink-0 text-[11px] uppercase tracking-[0.16em] text-ink/50">
        {[note, count !== undefined ? `${count} ${count === 1 ? "post" : "posts"}` : null]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </div>
  );
}

/**
 * Which tables have posted, from the per-table card codes (0159). Shown once
 * any post came from a table card: before that every table is "quiet" and
 * the line says nothing useful. Lists the quiet ones so the couple (or a
 * friend with the photographer) knows where to point a camera.
 */
function TableCoverage({ posts, tables }: { posts: GuestPost[]; tables: Table[] }) {
  const posted = new Set(posts.map((p) => p.seating_table_id).filter(Boolean));
  if (tables.length === 0 || posted.size === 0) return null;
  const quiet = tables.filter((t) => !posted.has(t.id));
  const count = tables.length - quiet.length;
  return (
    <div className="mb-4 rounded-lg border border-hairline bg-parchment px-4 py-3 text-sm">
      <p className="text-ink">
        <span className="font-medium">
          {count} of {tables.length} tables
        </span>{" "}
        have shared photos.
      </p>
      {quiet.length > 0 && (
        <p className="mt-1 text-ink/70">
          Still quiet: {quiet.map((t) => t.name).join(", ")}
        </p>
      )}
    </div>
  );
}
