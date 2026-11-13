import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuestSiteTheme } from "@/components/guest-site-theme";
import { GuestSiteView, type GuestSiteContent } from "@/app/w/[slug]/guest-site-view";
import { STARTER_DESIGN, applyTemplate, templateById, withExtras } from "@/lib/site-templates";
import { PALETTES, paletteColors } from "@/lib/site-design";
import type { PublicWedding } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "Guest site (prototype)", robots: { index: false } };

/**
 * A guest site template with a sample couple and no account, for visual QA
 * of the suites (`?t=<template>&c=<colourway>&long=1&photo=0`). Nothing is
 * read or saved. Off in production, like the Studio prototype.
 */
export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string; c?: string; long?: string; photo?: string }> }) {
  if (process.env.NODE_ENV === "production" && process.env.STD_PROTOTYPE !== "1") notFound();
  const { t = "highland-lake", c, long, photo } = await searchParams;
  const template = templateById(t);
  if (!template) notFound();
  const base = applyTemplate(STARTER_DESIGN, template);
  let design = { ...base, ...withExtras(base, template) };
  const colourway = PALETTES.find((p) => p.id === c);
  if (colourway) design = { ...design, ...paletteColors(colourway) };

  const wedding: PublicWedding = {
    id: "prototype",
    public_slug: "avery-and-jordan",
    partner_a_name: long ? "José-María" : "Avery",
    partner_b_name: long ? "Zoë Anastasia" : "Jordan",
    wedding_date: "2027-06-12",
    region: null,
    hero_photo_url: photo === "0" ? null : "/landing/hero-couple-2000.webp",
    rsvp_deadline: "2027-05-01",
    dress_code: "Black tie optional",
    travel_notes: "Fly into Aspen/Pitkin County Airport (ASE), about ten minutes from town.",
    venue_name: "The Lake House",
    venue_city: long ? "Saint-Rémy-de-Provence" : "Aspen",
    venue_state: long ? "France" : "Colorado",
    itinerary_published: true,
    site_design: design,
    venue_photo_urls: null,
    venue_about: null,
    venue_address: null,
    site_locked: false,
    venue_photos_own: false,
    venue_latitude: null,
    venue_longitude: null,
    gift_venmo: null,
    gift_paypal: null,
    gift_cashapp: null,
    gift_zelle: null,
    meal_options: null,
    ask_dietary: false,
  };
  const content = {
    blocks: [],
    registryItems: [],
    registryGifts: [],
    itineraryEvents: [],
    weddingFaqs: [],
    accommodations: [],
    guestbookEntries: [],
    galleryPhotos: [],
    confirmedGuests: [],
    partyMembers: [],
    photoCredits: [],
  } as unknown as GuestSiteContent;

  return (
    <GuestSiteTheme design={design} preview>
      <GuestSiteView wedding={wedding} content={content} />
    </GuestSiteTheme>
  );
}
