"use client";

import { useTransition } from "react";
import { setFeedbackStatus } from "./actions";
import type { AssistantConversation, FeedbackStatus, FeedbackSubmission } from "@/lib/supabase/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const CATEGORY_LABEL: Record<FeedbackSubmission["category"], string> = {
  bug: "Bug",
  idea: "Idea",
  other: "Other",
};

const STATUS_STYLE: Record<FeedbackStatus, string> = {
  new: "border-brass bg-brass/10 text-brass",
  read: "border-hairline text-ink/60",
  resolved: "border-forest bg-forest/10 text-forest",
};

function StatusSelect({ feedbackId, status }: { feedbackId: string; status: FeedbackStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const formData = new FormData();
    formData.set("feedback_id", feedbackId);
    formData.set("status", next);
    startTransition(async () => {
      await setFeedbackStatus(formData);
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize outline-none disabled:opacity-60 ${STATUS_STYLE[status]}`}
    >
      <option value="new">New</option>
      <option value="read">Read</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}

export function AdminFeedbackManager({
  feedback,
  coupleNameByWeddingId,
  conversations,
}: {
  feedback: FeedbackSubmission[];
  coupleNameByWeddingId: Record<string, string>;
  conversations: AssistantConversation[];
}) {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-forest">
            Feedback ({feedback.length})
          </h2>
        </div>
        {feedback.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No feedback submitted yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {feedback.map((item) => (
              <div key={item.id} className="rounded-lg border border-hairline bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest">
                      {CATEGORY_LABEL[item.category]}
                    </span>
                    <span className="text-xs text-ink/50">
                      {item.wedding_id ? coupleNameByWeddingId[item.wedding_id] ?? "Unknown couple" : "No wedding yet"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-numbers text-xs text-ink/40">
                      {formatDate(item.created_at)}
                    </span>
                    <StatusSelect feedbackId={item.id} status={item.status} />
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-forest">
          Assistant Q&amp;A ({conversations.length})
        </h2>
        {conversations.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No questions asked yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {conversations.map((c) => (
              <div key={c.id} className="rounded-lg border border-hairline bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-ink/50">
                    {c.wedding_id ? coupleNameByWeddingId[c.wedding_id] ?? "Unknown couple" : "No wedding yet"}
                  </span>
                  <span className="font-mono-numbers text-xs text-ink/40">{formatDate(c.created_at)}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-ink">{c.question}</p>
                <p className="mt-1 text-sm text-ink/70">{c.answer}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
