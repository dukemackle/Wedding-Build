"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useInListingModal } from "@/components/listing-modal";
import {
  DirectionsIcon,
  LinkIcon,
  ListingMenu,
  QuoteIcon,
  ShareIcon,
  copyLink,
  shareLink,
  useFlash,
  type ListingMenuItem,
} from "@/components/listing-menu";

type Props = {
  name: string;
  /** The listing's own address, for Share and Copy link. */
  href: string;
  /** Where Back goes when there's no search to go back to (a shared link). */
  fallbackHref: string;
  /** The heart, already wired to the right table; absent with no wedding to save to. */
  save?: ReactNode;
  directions?: string;
  /** The id of the side box holding the quote form, and its button's words. */
  contactId?: string;
  contactLabel?: string;
};

function menuItems({ href, directions, contactId, contactLabel = "Request a quote" }: Props): ListingMenuItem[] {
  return [
    { label: "Copy link", icon: <LinkIcon />, onSelect: () => copyLink(href) },
    ...(directions
      ? [{ label: "Get directions", icon: <DirectionsIcon />, onSelect: () => void window.open(directions, "_blank", "noopener") }]
      : []),
    ...(contactId
      ? [
          {
            label: contactLabel,
            icon: <QuoteIcon />,
            onSelect: () => document.getElementById(contactId)?.scrollIntoView({ behavior: "smooth", block: "start" }),
          },
        ]
      : []),
  ];
}

/**
 * A phone's listing header: Back on the left and a frosted pill (save,
 * share, more) on the right, floating over the first photo and staying in
 * reach as the page scrolls. With no photos it sits in the page on navy.
 */
export function ListingPhoneBar(props: Props & { overPhoto: boolean }) {
  const { name, href, fallbackHref, save, overPhoto } = props;
  const router = useRouter();
  const inModal = useInListingModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [flash, setFlash] = useFlash();
  const items = menuItems(props);

  function back() {
    // From the results the listing is a panel over them, and back is exactly
    // that. From anywhere else, back only if it stays on this site.
    const fromHere = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (inModal || (fromHere && window.history.length > 1)) router.back();
    else router.push(fallbackHref);
  }

  const surface = overPhoto
    ? "bg-ink/40 text-white shadow-lg ring-1 ring-white/25 backdrop-blur-md"
    : "bg-forest text-white";

  const bar = (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={back}
        aria-label="Back"
        className={`flex h-11 w-11 items-center justify-center rounded-full ${surface}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>
      <div className={`flex h-11 items-center gap-1 rounded-full px-1 ${surface}`}>
        {save}
        <button
          type="button"
          aria-label={`Share ${name}`}
          onClick={async () => {
            const message = await shareLink(name, href);
            if (message) setFlash(message);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full"
        >
          <ShareIcon />
        </button>
        <ListingMenu
          name={name}
          items={items}
          open={menuOpen}
          onOpenChange={setMenuOpen}
          buttonClassName="flex h-10 w-10 items-center justify-center rounded-full"
        />
      </div>
      {flash}
    </div>
  );

  return overPhoto ? (
    // Zero height so the photo starts at the top; sticky so it stays as the page scrolls.
    <div className="sticky top-0 z-20 -mx-1 h-0 sm:hidden">
      <div className="pt-3">{bar}</div>
    </div>
  ) : (
    <div className="-mx-1 mb-4 sm:hidden">{bar}</div>
  );
}

/** Desktop: Save, Share and ••• in a row beside the listing's name. */
export function ListingDesktopActions(props: Props) {
  const { name, href, save } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [flash, setFlash] = useFlash();
  const items = menuItems(props);

  return (
    <div className="hidden shrink-0 items-center gap-2 sm:flex">
      {save}
      <button
        type="button"
        onClick={async () => {
          const message = await shareLink(name, href);
          if (message) setFlash(message);
        }}
        className="flex items-center gap-1.5 rounded-full border border-hairline bg-parchment px-3 py-1 text-sm text-ink transition-colors hover:border-forest"
      >
        <span className="[&_svg]:h-4 [&_svg]:w-4">
          <ShareIcon />
        </span>
        Share
      </button>
      <ListingMenu
        name={name}
        items={items}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        buttonClassName="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-hairline bg-parchment text-ink transition-colors hover:border-forest"
      />
      {flash}
    </div>
  );
}
