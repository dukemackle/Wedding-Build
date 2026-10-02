-- Wren chats and feedback were keyed to auth.uid() with no foreign key, so
-- deleting an account left them behind -- the privacy policy promises they
-- go with it. Clear what's already orphaned, then cascade from now on.
delete from assistant_conversations
  where user_id not in (select id from auth.users);
delete from feedback_submissions
  where user_id not in (select id from auth.users);

alter table assistant_conversations
  drop constraint if exists assistant_conversations_user_id_fkey,
  add constraint assistant_conversations_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

alter table feedback_submissions
  drop constraint if exists feedback_submissions_user_id_fkey,
  add constraint feedback_submissions_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

-- The admin "chat themes" box reads the last 30 days.
create index if not exists assistant_conversations_created_at_idx
  on assistant_conversations (created_at);
