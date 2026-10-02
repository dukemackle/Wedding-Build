"use client";

import { useFormStatus } from "react-dom";

/**
 * A submit button for a server-action form that disables itself while the
 * action runs, so a second tap on a slow phone doesn't send it twice.
 */
export function PendingSubmit({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
