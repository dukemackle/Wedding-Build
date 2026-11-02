-- Dashboard photos now go from the browser straight to Storage on a signed
-- upload URL (startDashboardPhotoUpload), so the app's own 5MB and
-- image-only checks no longer see the bytes. Storage enforces them instead.
-- The browser shrinks every photo to ~2000px JPEG first (well under 1MB),
-- so 6MB is headroom, not a target.
update storage.buckets
set file_size_limit = 6291456,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif']
where id = 'wedding-photos';
