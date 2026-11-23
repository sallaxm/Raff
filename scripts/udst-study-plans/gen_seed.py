import json, re, sys
from collections import Counter

plans = json.load(open(sys.argv[1]))
BASE = "https://www.udst.edu.qa"
URLS = {l.strip().rsplit('/',1)[-1]: l.strip() for l in open(sys.argv[2])}

import importlib.util
_spec = importlib.util.spec_from_file_location("cfg", sys.argv[4])
cfg = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(cfg)
MAP = cfg.MAP
SHORT_OVERRIDE = getattr(cfg, "SHORT_OVERRIDE", {})
LEVEL = cfg.LEVEL
KEEP_NAMES = getattr(cfg, "KEEP_NAMES", False)

def clean_name(t):
    t = re.sub(r'\s*\([^()]*\)\s*$', '', t).strip()
    t = t.replace('–', '-')
    t = re.sub(r'\s+-\s+', ' – ', t)
    return t

majors, courses, links = [], {}, []
titles = {}
for p in plans:
    college, mslug = MAP[p['slug']]
    majors.append(dict(slug=mslug, college=college, name=clean_name(p['title']),
                       short=SHORT_OVERRIDE.get(p['slug'], p['abbr']), url=BASE + URLS[p['slug']], plan=p['plan'],
                       level=LEVEL(p['title'])))
    seen = {}
    for c in p['courses']:
        titles.setdefault(c['code'], Counter())[c['title']] += 1
        if c['credits'] is not None:
            courses.setdefault(c['code'], c['credits'])
        prev = seen.get(c['code'])
        # keep one row per course per major; prefer the required (non-elective) placement
        if prev is None or (prev['elective'] and not c['elective']):
            seen[c['code']] = c
    for c in seen.values():
        links.append(dict(major=mslug, code=c['code'], year=c['year'], term=c['term'],
                          elective=c['elective'], group=c['group']))

course_rows = [dict(code=k, name=v.most_common(1)[0][0], credits=courses.get(k)) for k, v in sorted(titles.items())]
for c in course_rows:
    assert '|' not in c['name'] and '\n' not in c['name'] and '$' not in c['name']

# Compact text encoding (keeps the migration small):
#   courses: one "CODE|Title|credits" per line
#   programs: one line per program:  slug|college|name|short|url|plan|groups|links
#     groups = elective-pool labels joined by "~"
#     links  = "CODE:year:term:groupIndex" joined by ","  (groupIndex 0 = required)
course_txt = "\n".join(f"{c['code']}|{c['name']}|{c['credits'] if c['credits'] is not None else ''}" for c in course_rows)
prog_lines = []
for m in majors:
    ls = [l for l in links if l['major'] == m['slug']]
    groups = []
    for l in ls:
        if l['group'] and l['group'] not in groups: groups.append(l['group'])
    enc = ",".join(f"{l['code']}:{l['year']}:{l['term']}:{groups.index(l['group'])+1 if l['group'] else 0}" for l in ls)
    for v in (m['name'], m['short'] or '', m['url'], m['plan'] or '', m['level']) + tuple(groups):
        assert '|' not in v and '~' not in v and '\n' not in v and '$' not in v, v
    fields = [m['slug'], m['college'], m['name'], m['short'] or '', m['url'], m['plan'] or '', "~".join(groups), enc]
    if cfg.WITH_LEVEL: fields.append(m['level'])
    prog_lines.append("|".join(fields))
prog_txt = "\n".join(prog_lines)

sql = f"""-- 050_seed_udst_study_plans.sql
-- Official UDST bachelor study plans ({plans[0]['plan']}), taken from the program pages on
-- https://www.udst.edu.qa : {len(majors)} programs, {len(course_rows)} courses,
-- {len(links)} program-course links (year, term within the year, elective pools).
--
-- Idempotent: programs/courses are upserted by slug/code and each seeded program's
-- course list is replaced. Uploaded resources keep pointing at the same course rows.
--
-- Data format (compact, to keep this file small):
--   courses : "CODE|Title|credits" per line
--   programs: "slug|college|name|short|url|plan|group1~group2|CODE:year:term:group,..." per line
--             (group 0 = required course, n = n-th elective pool)

insert into public.colleges (institution_id, slug, name)
values ('udst', 'general-education', 'College of General Education')
on conflict (institution_id, slug) do nothing;

create temporary table _udst_courses as
select split_part(l, '|', 1) as code,
       split_part(l, '|', 2) as name,
       nullif(split_part(l, '|', 3), '')::int as credits
from regexp_split_to_table($c$
{course_txt}
$c$, '\\n') as l
where l <> '';

create temporary table _udst_programs as
select split_part(l, '|', 1) as slug,
       split_part(l, '|', 2) as college,
       split_part(l, '|', 3) as name,
       nullif(split_part(l, '|', 4), '') as short_name,
       split_part(l, '|', 5) as source_url,
       nullif(split_part(l, '|', 6), '') as plan_year,
       string_to_array(nullif(split_part(l, '|', 7), ''), '~') as groups,
       split_part(l, '|', 8) as links
from regexp_split_to_table($p$
{prog_txt}
$p$, '\\n') as l
where l <> '';

-- Programs
insert into public.majors (institution_id, college, college_id, slug, name, short_name, source_url, plan_year)
select 'udst', p.college, c.id, p.slug, p.name, p.short_name, p.source_url, p.plan_year
from _udst_programs p
join public.colleges c on c.institution_id = 'udst' and c.slug = p.college
on conflict (institution_id, slug) do update
set name = excluded.name,
    college = excluded.college,
    college_id = excluded.college_id,
    short_name = excluded.short_name,
    source_url = excluded.source_url,
    plan_year = excluded.plan_year;

-- Courses (official titles win)
insert into public.courses (institution_id, code, name, credits)
select 'udst', code, name, credits from _udst_courses
on conflict (institution_id, code) do update
set name = excluded.name,
    credits = coalesce(excluded.credits, public.courses.credits);

-- Replace the course list of every seeded program
delete from public.major_courses mc
using public.majors m
where mc.major_id = m.id
  and m.institution_id = 'udst'
  and m.slug in (select slug from _udst_programs);

insert into public.major_courses (major_id, course_id, year, semester, is_elective, elective_group)
select m.id, co.id,
       split_part(x, ':', 2)::int,
       split_part(x, ':', 3)::int,
       split_part(x, ':', 4)::int > 0,
       p.groups[nullif(split_part(x, ':', 4)::int, 0)]
from _udst_programs p
cross join lateral regexp_split_to_table(p.links, ',') as x
join public.majors m on m.institution_id = 'udst' and m.slug = p.slug
join public.courses co on co.institution_id = 'udst' and co.code = split_part(x, ':', 1)
on conflict (major_id, course_id) do nothing;

-- Remove placeholder sample courses (old seed) that nothing references
delete from public.courses c
where c.code in ('CS101', 'MATH101', 'ENG102')
  and not exists (select 1 from public.resources r where r.course_id = c.id)
  and not exists (select 1 from public.major_courses mc where mc.course_id = c.id);

drop table _udst_courses;
drop table _udst_programs;
"""
open(sys.argv[3], 'w').write(sql)
print(len(majors), "majors", len(course_rows), "courses", len(links), "links", len(sql)//1024, "KB")
