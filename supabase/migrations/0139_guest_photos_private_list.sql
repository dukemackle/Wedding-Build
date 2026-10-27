-- Guest photos (photo wall, RSVPs) could be listed by anyone. The bucket is
-- public so approved photos load by URL, but the "anyone can view" select
-- policy from 0026 also let the public anon key list `<wedding_id>/` and pull
-- every photo, pending, hidden or rejected. Dropping it closes the listing;
-- public URLs keep working (public buckets serve files without RLS), and
-- each URL holds a random UUID, so a photo nobody was shown can't be found.
--
-- Nothing in the app lists or reads this bucket with a user's key: uploads,
-- removals and account deletion all use the service role, which skips RLS.
drop policy if exists "anyone can view guest photos" on storage.objects;
