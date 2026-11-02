"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shrinkImage } from "@/lib/shrink-image";
import { putToSignedUrl } from "@/lib/signed-upload";
import { saveDashboardPhoto, startDashboardPhotoUpload } from "./actions";

/** How many photos go up at once. */
const PARALLEL = 3;
/** Matches the wedding-photos bucket's limit (migration 0152). */
const MAX_BYTES = 6 * 1024 * 1024;

export type PhotoUpload = {
  id: string;
  name: string;
  /** An object URL for the thumbnail; empty until the photo is ready. */
  preview: string;
  status: "waiting" | "uploading" | "saving" | "done" | "failed";
  /** 0-1, of the bytes going up. */
  progress: number;
  error?: string;
};

type Job = {
  file: File;
  ready?: File;
  path?: string;
  signedUrl?: string;
  uploaded?: boolean;
};

/**
 * The upload queue behind "Choose photos": each picked photo is shrunk in
 * the browser, sent straight to Storage on its own signed URL (three at a
 * time), then added to the dashboard. A photo that fails stays in the list
 * with its reason and can be retried on its own; the rest carry on.
 * `onIdle` runs once the queue empties with at least one photo added.
 */
export function usePhotoUploads(onIdle: () => void) {
  const [uploads, setUploads] = useState<PhotoUpload[]>([]);
  const jobs = useRef(new Map<string, Job>());
  const queue = useRef<string[]>([]);
  const active = useRef(0);
  const addedSinceIdle = useRef(0);
  // Saves run one after another: each appends to the same list on the wedding.
  const saves = useRef<Promise<unknown>>(Promise.resolve());
  const idle = useRef(onIdle);
  useEffect(() => {
    idle.current = onIdle;
  });

  const update = useCallback((id: string, patch: Partial<PhotoUpload>) => {
    setUploads((list) =>
      list.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const runOne = useCallback(
    async (id: string) => {
      const job = jobs.current.get(id);
      if (!job) return;
      update(id, { status: "uploading", progress: 0, error: undefined });
      try {
        if (!job.ready) {
          job.ready = await shrinkImage(job.file);
          update(id, { preview: URL.createObjectURL(job.ready) });
        }
        if (job.ready.size > MAX_BYTES) throw new Error("too large");
        if (!job.uploaded) {
          if (!job.path || !job.signedUrl) {
            const started = await startDashboardPhotoUpload(job.ready.name);
            if (started.error || !started.path || !started.signedUrl)
              throw new Error(started.error ?? "start");
            job.path = started.path;
            job.signedUrl = started.signedUrl;
          }
          await putToSignedUrl(job.signedUrl, job.ready, (p) =>
            update(id, { progress: p }),
          );
          job.uploaded = true;
        }
        update(id, { status: "saving", progress: 1 });
        const path = job.path!;
        const saved = (saves.current = saves.current.then(
          () => saveDashboardPhoto(path),
          () => saveDashboardPhoto(path),
        )) as Promise<{ error?: string }>;
        const result = await saved;
        if (result.error) throw new Error(result.error);
        addedSinceIdle.current += 1;
        update(id, { status: "done" });
      } catch (err) {
        // A fresh signed URL next time, unless the bytes already landed.
        if (!job.uploaded) job.signedUrl = job.path = undefined;
        update(id, { status: "failed", error: reason(err) });
      }
    },
    [update],
  );

  // Starts queued photos up to PARALLEL; each one finishing starts the next.
  const pumpRef = useRef<() => void>(() => {});
  const pump = useCallback(() => pumpRef.current(), []);
  useEffect(() => {
    pumpRef.current = () => {
      while (active.current < PARALLEL && queue.current.length > 0) {
        const id = queue.current.shift()!;
        active.current += 1;
        runOne(id).finally(() => {
          active.current -= 1;
          pump();
          if (
            active.current === 0 &&
            queue.current.length === 0 &&
            addedSinceIdle.current > 0
          ) {
            addedSinceIdle.current = 0;
            idle.current();
          }
        });
      }
    };
  }, [runOne, pump]);

  const add = useCallback(
    (files: File[]) => {
      const added = files.map((file) => {
        const id = crypto.randomUUID();
        jobs.current.set(id, { file });
        queue.current.push(id);
        return {
          id,
          name: file.name,
          preview: "",
          status: "waiting" as const,
          progress: 0,
        };
      });
      setUploads((list) => [...list, ...added]);
      pump();
    },
    [pump],
  );

  const retry = useCallback(
    (id: string) => {
      update(id, { status: "waiting", progress: 0, error: undefined });
      queue.current.push(id);
      pump();
    },
    [pump, update],
  );

  /** Drops finished photos (once the page shows them) or a failed one. */
  const dismiss = useCallback((which: (u: PhotoUpload) => boolean) => {
    setUploads((list) =>
      list.filter((u) => {
        if (!which(u)) return true;
        if (u.preview) URL.revokeObjectURL(u.preview);
        jobs.current.delete(u.id);
        return false;
      }),
    );
  }, []);

  const busy = uploads.some(
    (u) =>
      u.status === "waiting" ||
      u.status === "uploading" ||
      u.status === "saving",
  );

  // Leaving mid-upload would lose the photos still going up.
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  return { uploads, busy, add, retry, dismiss };
}

function reason(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (message === "too large") return "Too large, even after shrinking";
  if (message === "network") return "Connection dropped";
  if (message === "start" || message.startsWith("upload failed"))
    return "Didn't upload";
  return message || "Didn't upload";
}
