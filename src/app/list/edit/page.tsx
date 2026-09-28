import { EditLinkForm } from "./edit-link-form";

export const metadata = {
  title: "Edit my listing",
};

export default function EditMyListingPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 shadow-sm sm:p-10">
        <p className="font-mono-numbers text-xs uppercase tracking-[0.2em] text-brass">Venues &amp; vendors</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-forest">Edit my listing</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Enter the email on your listing and we&apos;ll send you a private link to update it. Changes go
          live once we&apos;ve reviewed them.
        </p>
        <EditLinkForm />
      </div>
    </main>
  );
}
