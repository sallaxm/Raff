-- 012_courses_unique_institution_code.sql
-- Prevent duplicate courses like "MATH2010" getting inserted twice.

create unique index if not exists uq_courses_institution_code
on public.courses (institution_id, code);