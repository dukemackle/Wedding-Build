export function PageSkeleton({
  maxWidthClassName = "max-w-2xl",
}: {
  maxWidthClassName?: string;
}) {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16">
      <div className={`mb-6 flex w-full ${maxWidthClassName} items-center justify-between`}>
        <div className="h-4 w-64 animate-pulse rounded bg-hairline/40" />
        <div className="h-4 w-16 animate-pulse rounded bg-hairline/40" />
      </div>
      <div className={`w-full ${maxWidthClassName}`}>
        <div className="h-3 w-20 animate-pulse rounded bg-hairline/40" />
        <div className="mt-2 mb-6 h-8 w-64 animate-pulse rounded bg-hairline/40" />
        <div className="rounded-lg border border-hairline bg-card p-5 sm:p-8 shadow-sm">
          <div className="space-y-4">
            <div className="h-4 w-full animate-pulse rounded bg-hairline/30" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-hairline/30" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-hairline/30" />
          </div>
        </div>
      </div>
    </main>
  );
}
