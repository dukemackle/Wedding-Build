// Every vendor batch the app ships: the earlier ones in src/lib/vendor-batches.ts
// (closed to new batches) plus one file per state here. One file per state
// lets several batch PRs run at once without touching the same lines. A new
// batch goes at the end of its state's file, never in vendor-batches.ts.
import { VENDOR_BATCHES, type VendorBatch } from "@/lib/vendor-batches";
import alabama from "@/lib/batches/vendors/alabama";
import alaska from "@/lib/batches/vendors/alaska";
import arizona from "@/lib/batches/vendors/arizona";
import arkansas from "@/lib/batches/vendors/arkansas";
import california from "@/lib/batches/vendors/california";
import colorado from "@/lib/batches/vendors/colorado";
import connecticut from "@/lib/batches/vendors/connecticut";
import delaware from "@/lib/batches/vendors/delaware";
import districtOfColumbia from "@/lib/batches/vendors/district-of-columbia";
import florida from "@/lib/batches/vendors/florida";
import georgia from "@/lib/batches/vendors/georgia";
import hawaii from "@/lib/batches/vendors/hawaii";
import idaho from "@/lib/batches/vendors/idaho";
import illinois from "@/lib/batches/vendors/illinois";
import indiana from "@/lib/batches/vendors/indiana";
import iowa from "@/lib/batches/vendors/iowa";
import kansas from "@/lib/batches/vendors/kansas";
import kentucky from "@/lib/batches/vendors/kentucky";
import louisiana from "@/lib/batches/vendors/louisiana";
import maine from "@/lib/batches/vendors/maine";
import maryland from "@/lib/batches/vendors/maryland";
import massachusetts from "@/lib/batches/vendors/massachusetts";
import michigan from "@/lib/batches/vendors/michigan";
import minnesota from "@/lib/batches/vendors/minnesota";
import mississippi from "@/lib/batches/vendors/mississippi";
import missouri from "@/lib/batches/vendors/missouri";
import montana from "@/lib/batches/vendors/montana";
import nebraska from "@/lib/batches/vendors/nebraska";
import nevada from "@/lib/batches/vendors/nevada";
import newHampshire from "@/lib/batches/vendors/new-hampshire";
import newJersey from "@/lib/batches/vendors/new-jersey";
import newMexico from "@/lib/batches/vendors/new-mexico";
import newYork from "@/lib/batches/vendors/new-york";
import northCarolina from "@/lib/batches/vendors/north-carolina";
import northDakota from "@/lib/batches/vendors/north-dakota";
import ohio from "@/lib/batches/vendors/ohio";
import oklahoma from "@/lib/batches/vendors/oklahoma";
import oregon from "@/lib/batches/vendors/oregon";
import pennsylvania from "@/lib/batches/vendors/pennsylvania";
import rhodeIsland from "@/lib/batches/vendors/rhode-island";
import southCarolina from "@/lib/batches/vendors/south-carolina";
import southDakota from "@/lib/batches/vendors/south-dakota";
import tennessee from "@/lib/batches/vendors/tennessee";
import texas from "@/lib/batches/vendors/texas";
import utah from "@/lib/batches/vendors/utah";
import vermont from "@/lib/batches/vendors/vermont";
import virginia from "@/lib/batches/vendors/virginia";
import washington from "@/lib/batches/vendors/washington";
import westVirginia from "@/lib/batches/vendors/west-virginia";
import wisconsin from "@/lib/batches/vendors/wisconsin";
import wyoming from "@/lib/batches/vendors/wyoming";

export const VENDOR_BATCHES_BY_STATE: Record<string, VendorBatch[]> = {
  Alabama: alabama,
  Alaska: alaska,
  Arizona: arizona,
  Arkansas: arkansas,
  California: california,
  Colorado: colorado,
  Connecticut: connecticut,
  Delaware: delaware,
  "District of Columbia": districtOfColumbia,
  Florida: florida,
  Georgia: georgia,
  Hawaii: hawaii,
  Idaho: idaho,
  Illinois: illinois,
  Indiana: indiana,
  Iowa: iowa,
  Kansas: kansas,
  Kentucky: kentucky,
  Louisiana: louisiana,
  Maine: maine,
  Maryland: maryland,
  Massachusetts: massachusetts,
  Michigan: michigan,
  Minnesota: minnesota,
  Mississippi: mississippi,
  Missouri: missouri,
  Montana: montana,
  Nebraska: nebraska,
  Nevada: nevada,
  "New Hampshire": newHampshire,
  "New Jersey": newJersey,
  "New Mexico": newMexico,
  "New York": newYork,
  "North Carolina": northCarolina,
  "North Dakota": northDakota,
  Ohio: ohio,
  Oklahoma: oklahoma,
  Oregon: oregon,
  Pennsylvania: pennsylvania,
  "Rhode Island": rhodeIsland,
  "South Carolina": southCarolina,
  "South Dakota": southDakota,
  Tennessee: tennessee,
  Texas: texas,
  Utah: utah,
  Vermont: vermont,
  Virginia: virginia,
  Washington: washington,
  "West Virginia": westVirginia,
  Wisconsin: wisconsin,
  Wyoming: wyoming,
};

export const ALL_VENDOR_BATCHES: VendorBatch[] = [...VENDOR_BATCHES, ...Object.values(VENDOR_BATCHES_BY_STATE).flat()];
