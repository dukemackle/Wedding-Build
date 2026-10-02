// Every venue batch the app ships: the earlier ones in src/lib/venue-batches.ts
// (closed to new batches) plus one file per state here. One file per state
// lets several batch PRs run at once without touching the same lines. A new
// batch goes at the end of its state's file, never in venue-batches.ts.
import { VENUE_BATCHES, type VenueBatch } from "@/lib/venue-batches";
import alabama from "@/lib/batches/venues/alabama";
import alaska from "@/lib/batches/venues/alaska";
import arizona from "@/lib/batches/venues/arizona";
import arkansas from "@/lib/batches/venues/arkansas";
import california from "@/lib/batches/venues/california";
import colorado from "@/lib/batches/venues/colorado";
import connecticut from "@/lib/batches/venues/connecticut";
import delaware from "@/lib/batches/venues/delaware";
import districtOfColumbia from "@/lib/batches/venues/district-of-columbia";
import florida from "@/lib/batches/venues/florida";
import georgia from "@/lib/batches/venues/georgia";
import hawaii from "@/lib/batches/venues/hawaii";
import idaho from "@/lib/batches/venues/idaho";
import illinois from "@/lib/batches/venues/illinois";
import indiana from "@/lib/batches/venues/indiana";
import iowa from "@/lib/batches/venues/iowa";
import kansas from "@/lib/batches/venues/kansas";
import kentucky from "@/lib/batches/venues/kentucky";
import louisiana from "@/lib/batches/venues/louisiana";
import maine from "@/lib/batches/venues/maine";
import maryland from "@/lib/batches/venues/maryland";
import massachusetts from "@/lib/batches/venues/massachusetts";
import michigan from "@/lib/batches/venues/michigan";
import minnesota from "@/lib/batches/venues/minnesota";
import mississippi from "@/lib/batches/venues/mississippi";
import missouri from "@/lib/batches/venues/missouri";
import montana from "@/lib/batches/venues/montana";
import nebraska from "@/lib/batches/venues/nebraska";
import nevada from "@/lib/batches/venues/nevada";
import newHampshire from "@/lib/batches/venues/new-hampshire";
import newJersey from "@/lib/batches/venues/new-jersey";
import newMexico from "@/lib/batches/venues/new-mexico";
import newYork from "@/lib/batches/venues/new-york";
import northCarolina from "@/lib/batches/venues/north-carolina";
import northDakota from "@/lib/batches/venues/north-dakota";
import ohio from "@/lib/batches/venues/ohio";
import oklahoma from "@/lib/batches/venues/oklahoma";
import oregon from "@/lib/batches/venues/oregon";
import pennsylvania from "@/lib/batches/venues/pennsylvania";
import rhodeIsland from "@/lib/batches/venues/rhode-island";
import southCarolina from "@/lib/batches/venues/south-carolina";
import southDakota from "@/lib/batches/venues/south-dakota";
import tennessee from "@/lib/batches/venues/tennessee";
import texas from "@/lib/batches/venues/texas";
import utah from "@/lib/batches/venues/utah";
import vermont from "@/lib/batches/venues/vermont";
import virginia from "@/lib/batches/venues/virginia";
import washington from "@/lib/batches/venues/washington";
import westVirginia from "@/lib/batches/venues/west-virginia";
import wisconsin from "@/lib/batches/venues/wisconsin";
import wyoming from "@/lib/batches/venues/wyoming";

export const VENUE_BATCHES_BY_STATE: Record<string, VenueBatch[]> = {
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

export const ALL_VENUE_BATCHES: VenueBatch[] = [...VENUE_BATCHES, ...Object.values(VENUE_BATCHES_BY_STATE).flat()];
