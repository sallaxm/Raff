-- 017_credits_non_negative.sql
alter table public.profiles
drop constraint if exists credits_non_negative;

alter table public.profiles
add constraint credits_non_negative check (credits >= 0);