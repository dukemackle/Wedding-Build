-- Remembers the Google Sheet a couple imported from, so they can get back to
-- it from inside Wren.
--
-- One column rather than one per page: in practice it's a single workbook with
-- a Guests tab and a Budget tab, not two spreadsheets, so both importers set
-- and show the same link.
--
-- Only ever a URL the couple pasted themselves. Wren stores no file contents
-- and opening the link is a plain link-out to Google, not an integration.
alter table weddings add column if not exists spreadsheet_url text;
