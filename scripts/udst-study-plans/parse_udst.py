"""Parse UDST program pages (latest study plan) into structured course rows."""
import re, json, sys, glob, os
from html.parser import HTMLParser

CODE = re.compile(r'^[A-Z]{3,5}\d{4}[A-Z]?$')

class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.ev=[]; s.cell=None; s.row=None; s.h1=None; s.title=None
    def handle_starttag(s,t,a):
        a=dict(a)
        did = a.get('id') or ''
        if t=='div' and re.match(r'tab-views-bootstrap-tab-year(\d+)$', did):
            s.ev.append(('YEAR', int(re.search(r'(\d+)$', did).group(1))))
        elif t=='div' and re.match(r'tab-views-bootstrap-tabs-tabs-view-block-(\d+)$', did):
            # alternate layout: zero-based tab index, one tab per year
            s.ev.append(('YEAR', int(re.search(r'(\d+)$', did).group(1)) + 1))
        if t=='tr': s.row=[]
        if t in('td','th') and s.row is not None: s.cell=[]
        if t=='h1' and s.title is None: s.h1=[]
    def handle_endtag(s,t):
        if t in('td','th') and s.cell is not None and s.row is not None:
            s.row.append(' '.join(' '.join(s.cell).split())); s.cell=None
        if t=='tr' and s.row is not None: s.ev.append(('TR', s.row)); s.row=None
        if t=='h1' and s.h1 is not None:
            s.title=' '.join(''.join(s.h1).split()) or None; s.h1=None
    def handle_data(s,d):
        if s.cell is not None: s.cell.append(d)
        if s.h1 is not None: s.h1.append(d)

def parse(path):
    full=open(path,encoding='utf-8',errors='ignore').read()
    m=list(re.finditer(r'(\d{4}-\d{4}) Study Plan:', full))
    head=P(); head.feed(full)
    p=P(); p.feed(full[m[-1].start():] if m else full)
    year=None; sem=None; group=None; out=[]; seen=set(); sem_order={}
    for ev in p.ev:
        if ev[0]=='YEAR': year=ev[1]; continue
        row=ev[1]
        if not row or year is None: continue
        first=row[0]
        if len(row)==1 or not CODE.match(first):
            ms=re.match(r'SEMESTER\s+(\d+)', first, re.I)
            if ms: sem=int(ms.group(1)); group=None; continue
            if re.search(r'total', first, re.I): group=None; continue
            if len(row)==1 and first: group=first  # elective pool header
            continue
        if sem is None: continue
        cr=next((int(c) for c in row[2:] if re.fullmatch(r'\d{1,2}', c)), None)
        key=(year,sem,first)
        if key in seen: continue
        seen.add(key)
        # term within the year (UDST has up to 3 terms per year)
        sem_order.setdefault(year, [])
        if sem not in sem_order[year]: sem_order[year].append(sem)
        out.append(dict(year=year, term=sem_order[year].index(sem)+1, udst_semester=sem,
                        code=first, title=row[1], credits=cr,
                        elective=group is not None, group=group))
    title = head.title or os.path.basename(path)
    abbr = re.search(r'\(([^()]+)\)\s*$', title)
    return dict(slug=os.path.basename(path)[:-5], title=title, abbr=abbr.group(1) if abbr else None,
                plan=m[-1].group(1) if m else None, courses=out)

res=[parse(f) for f in sorted(glob.glob(sys.argv[1]+'/*.html'))]
json.dump(res, open(sys.argv[2],'w'), indent=1, ensure_ascii=False)
for r in res:
    req=[c for c in r['courses'] if not c['elective']]; el=[c for c in r['courses'] if c['elective']]
    print(f"{len(req):3d} req {len(el):3d} elec  yrs={sorted(set(c['year'] for c in r['courses']))} {r['abbr']}")
