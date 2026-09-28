import Link from "next/link";
import { STANDARD_WIDTH } from "@/lib/layout";
import { ListForm } from "./list-form";

export const metadata = {
  title: "List your business",
  description: "Venues and wedding vendors: get listed on You Do, I Do, free.",
};

export default function ListYourBusinessPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-14">
      <div className={`w-full ${STANDARD_WIDTH}`}>
        <ListForm />
        <p className="mt-8 text-center text-sm text-ink/60">
          Already on You Do, I Do?{" "}
          <Link href="/list/edit" className="font-medium text-brass hover:underline">
            Edit my listing
          </Link>
        </p>
      </div>
    </main>
  );
}
