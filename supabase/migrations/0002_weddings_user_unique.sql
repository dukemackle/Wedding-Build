-- Enforce one wedding per user, and let the app upsert on user_id.
alter table weddings add constraint weddings_user_id_key unique (user_id);
