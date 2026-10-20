-- Removes listings that were imported twice: the same business under two
-- pages of its site (e.g. /weddings and the home page), which the importer
-- keys as two websites. Each pair keeps the copy from the earlier batch row.
-- The later batch rows came out of the batch files in #822 and in the PR
-- that adds this file, so the hourly import won't add them back: run this
-- only after that PR is merged. A row is deleted only when its kept twin is
-- present, so no business disappears. Saves or inquiries attached to a
-- deleted copy go with it (per the foreign keys); before launch that can
-- only be the owner's own test data.

delete from public.venues as d
using (values
  ('armatureworks.com/wedding-venues-tampa', 'armatureworks.com'),
  ('ashmillfarm.com', 'ashmillfarm.com/weddings'),
  ('atlantabg.org', 'atlantabg.org/events-exhibitions/private-events-rentals'),
  ('basinharbor.com', 'basinharbor.com/weddings'),
  ('bostonharborhotel.com', 'bostonharborhotel.com/weddings'),
  ('bylandmark.com/our-venues/venue-showcase-stone-house', 'bylandmark.com/venues/stone-house'),
  ('bylandmark.com/venues/hudson-house', 'bylandmark.com/our-venues/venue-showcase-hudson-house'),
  ('cameronestateinn.com/weddings/weddings-at-cameron-estate', 'cameronestateinn.com'),
  ('castlefarms.com', 'castlefarms.com/weddings'),
  ('chathambarsinn.com', 'chathambarsinn.com/weddings'),
  ('chattnaturecenter.org/weddings', 'chattnaturecenter.org'),
  ('chetola.com/north-carolina-wedding-venues', 'chetola.com/weddings'),
  ('claxtonfarm.com', 'claxtonfarm.com/weddings'),
  ('cottonwoodguestranch.com/weddings', 'cottonwoodguestranch.com'),
  ('davenporthousemuseum.org', 'davenporthousemuseum.org/weddings'),
  ('descansogardens.org/events/weddings', 'descansogardens.org/weddings'),
  ('dinosatmanakiki.com/weddings', 'dinosatmanakiki.com'),
  ('doncesar.com', 'doncesar.com/weddings'),
  ('edisonfordwinterestates.org/private-rentals/wedding-ceremonies', 'edisonfordwinterestates.org/weddings'),
  ('estateonthehalifax.com/weddings', 'estateonthehalifax.com'),
  ('fairchildgarden.org/garden-wedding-miami', 'fairchildgarden.org/weddings'),
  ('fearrington.com/pages/weddings', 'fearrington.com/weddings'),
  ('feltmansion.org/weddings', 'feltmansion.org'),
  ('fentonbrewery.com/weddings', 'fentonbrewery.com'),
  ('glenmeremansion.com', 'glenmeremansion.com/private-events'),
  ('hagley.org/weddings-hagley', 'hagley.org/weddings'),
  ('hoodriverhotel.com/weddings', 'hoodriverhotel.com'),
  ('hoteldel.com/gather/weddings', 'hoteldel.com/weddings'),
  ('hotelsettles.com/weddings-events', 'hotelsettles.com/weddings'),
  ('hummingbirdnestranch.com', 'hummingbirdnestranch.com/weddings-events'),
  ('inisfreeestate.com/weddings', 'inisfreeestate.com'),
  ('innatperrycabin.com/weddings-events', 'innatperrycabin.com'),
  ('innatquarryridge.com/facilities', 'innatquarryridge.com'),
  ('jekyllclub.com', 'jekyllclub.com/weddings'),
  ('katydepottx.com/the-venue', 'katydepottx.com'),
  ('linganorewines.com', 'linganorewines.com/weddings'),
  ('lodgetorreypines.com/weddings', 'lodgetorreypines.com'),
  ('magnoliastreamside.com', 'magnoliastreamside.com/weddings'),
  ('montgomeryparks.org/event-center', 'montgomeryparks.org/parks-and-trails/brookside-gardens'),
  ('morikami.org/weddings-ceremonies', 'morikami.org/weddings'),
  ('oheka.com', 'oheka.com/weddings.htm'),
  ('oldemillinn.com', 'oldemillinn.com/weddings'),
  ('oldwestburygardens.org', 'oldwestburygardens.org/private-events'),
  ('phipps.conservatory.org/plan-your-event/weddings', 'phipps.conservatory.org/weddings'),
  ('pontevedra.com/weddings', 'pontevedra.com/weddings/inn-club'),
  ('port393.com/weddings', 'port393.com'),
  ('ringling.org/about-ringling/venue-rentals/weddings', 'ringling.org/weddings'),
  ('salishlodge.com/wedding', 'salishlodge.com/weddings'),
  ('sanaview.com/farm/weddings-events', 'sanaview.com/farm'),
  ('sayremansion.com', 'sayremansion.com/wedding-venues-bethlehem-pa'),
  ('sbhistorical.org', 'sbhistorical.org/venue-rental'),
  ('seapines.com', 'seapines.com/weddings'),
  ('serenbe.com', 'serenbe.com/weddings-and-events'),
  ('skytop.com/group-events/weddings-venues', 'skytop.com/weddings'),
  ('stollerfamilyestate.com', 'stollerfamilyestate.com/private-events'),
  ('stoneridgefarminn.com', 'stoneridgefarminn.com/weddings'),
  ('tandalenaturebarn.com/venuepricing', 'tandalenaturebarn.com'),
  ('terrablanca.com', 'terrablanca.com/weddings-events'),
  ('tetherow.com/weddings', 'tetherow.com/weddings/your-day'),
  ('texasstateaquarium.org/visit/private-events/weddings', 'texasstateaquarium.org/weddings'),
  ('thebarnatstoneybrooke.com', 'thebarnatstoneybrooke.com/pricing'),
  ('thecedarroom.com', 'thecedarroom.com/weddings'),
  ('theevergreenpdx.com', 'theevergreenpdx.com/weddings'),
  ('thehideouttexas.com', 'thehideouttexas.com/special-events'),
  ('thehotelemma.com', 'thehotelemma.com/weddings'),
  ('thehotelhershey.com/celebrations/weddings.php', 'thehotelhershey.com/weddings'),
  ('thewhittemorehouse.com/wedding-venue-washington-dc', 'thewhittemorehouse.com'),
  ('valenzanowine.com', 'valenzanowine.com/winery-weddings'),
  ('wavehill.org', 'wavehill.org/weddings-private-events'),
  ('weddingsofdistinctionnj.com/venues/bonnet-island-estate', 'bonnetislandestate.com'),
  ('westonredbarnfarm.com', 'westonredbarnfarm.com/weddings'),
  ('wilddunes.com', 'wilddunesresort.com/gather/weddings'),
  ('winterthur.org/weddings-and-events', 'winterthurwedding.com'),
  ('woodrowwilsonhouse.org', 'woodrowwilsonhouse.org/host-an-event/weddings'),
  ('woodstockinn.com', 'woodstockinn.com/weddings'),
  ('worcesterart.org/venue-rental/weddings', 'worcesterart.org/rentals/weddings')
) as pair(keep_id, drop_id)
where d.source_id = pair.drop_id
  and exists (select 1 from public.venues k where k.source_id = pair.keep_id);

delete from public.vendors as d
using (values
  ('alpinepastryshoppe.com', 'alpinepastryshoppe.com/wedding-cakes'),
  ('benkerts.com', 'benkerts.com/wedding-cakes'),
  ('bitesofindulgence.com', 'bitesofindulgence.com/weddings'),
  ('cateringbysky.com', 'skyarmory.com/off-premise-catering/catering-for-weddings'),
  ('deltorophoto.com/wedding', 'deltorophoto.com'),
  ('dreamscapehairdesign.com', 'dreamscapehairdesign.com/bridal'),
  ('florecitas.net', 'florecitas.org'),
  ('geddesbakery.com', 'geddesbakery.com/wedding-cakes'),
  ('gsldjs.com', 'gsldjs.com/areas/ocean-county'),
  ('jasmineraefloral.com', 'jasmineraefloral.com/syracuse-florist-flower-delivery/wedding-flowers'),
  ('jonathanfulviocinema.com', 'jonathanfulviocinema.com/weddings'),
  ('lisaivlerevents.com', 'lisaivlerevents.com/nj-wedding-planner'),
  ('madelinescatering.com', 'madelinescatering.com/weddings'),
  ('mainstreetcateringflagstaff.com/weddings', 'mainstreetcateringflagstaff.com'),
  ('miasbrooklyn.com', 'miasbrooklyn.com/wedding-cakes'),
  ('seattle-wedding-videographer.com', 'seattle-wedding-videographer.com/tacoma-wedding-videographer'),
  ('socoinbloom.com', 'socoinbloomweddings.com'),
  ('stacykfloral.com', 'stacykfloral.com/pages/wedding-and-event-flowers'),
  ('tylerolearyproductions.com', 'tylerolearyweddingvideos.com'),
  ('videoinprogress.com/weddings', 'videoinprogress.com')
) as pair(keep_id, drop_id)
where d.source_id = pair.drop_id
  and exists (select 1 from public.vendors k where k.source_id = pair.keep_id);
