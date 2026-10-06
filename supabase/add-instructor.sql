-- First create your instructor account in Supabase Authentication > Users > Add user.
-- Use a strong password and enable Auto Confirm User. Students never need accounts.
-- Replace the placeholder with that account's UUID (not an email or a student ID).
insert into ai_study_private.instructors (user_id)
values ('REPLACE_WITH_INSTRUCTOR_AUTH_USER_UUID'::uuid)
on conflict (user_id) do nothing;
