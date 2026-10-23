import { vendorCategoryIconPaths } from "@/lib/vendor-category-icons";

/** A vendor category's icon in a gold disc, the same one its map pin carries. */
export function VendorCategoryIcon({ category, className = "h-6 w-6" }: { category: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#FFD301] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[64%] w-[64%]"
        fill="none"
        stroke="#14203D"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: vendorCategoryIconPaths(category) }}
      />
    </span>
  );
}
