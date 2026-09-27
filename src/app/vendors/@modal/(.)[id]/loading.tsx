import { ListingModal } from "@/components/listing-modal";

// Open the panel the moment a vendor is clicked, and fill it when the listing
// arrives -- otherwise the click looks like it did nothing for a beat.
export default function Loading() {
  return (
    <ListingModal title="Loading vendor">
      <div className="animate-pulse">
        <div className="h-[260px] rounded-lg bg-hairline/60 sm:h-[420px]" />
        <div className="mt-6 h-8 w-1/2 rounded bg-hairline/60" />
        <div className="mt-3 h-4 w-1/3 rounded bg-hairline/60" />
        <div className="mt-6 h-24 rounded bg-hairline/40" />
      </div>
    </ListingModal>
  );
}
