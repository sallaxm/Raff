# UDST study plan scraper

Builds the study-plan seed migrations (`050`, `051`) from the official program pages
linked at https://www.udst.edu.qa/admissions/all-programs.

```bash
cd scripts/udst-study-plans
mkdir -p work/pages && cd work
# 1. list program pages (bachelor / diploma / master)
for c in 12 13 14 15 16; do curl -sSL "https://www.udst.edu.qa/admissions/all-programs?college=$c"; done \
  | grep -oE 'href="/[^"]*(bachelor|diploma|master)[^"]*"' | sed 's/href="//;s/"$//' \
  | grep -v '^/ar/' | sort -u > urls.txt
# 2. download each page
while read u; do curl -sSL -o "pages/${u##*/}.html" "https://www.udst.edu.qa$u"; done < urls.txt
# 3. parse the latest study plan on each page
python3 ../parse_udst.py pages plans.json
# 4. generate SQL (cfg_*.py maps each page to a college + program slug)
python3 ../gen_seed.py plans.json urls.txt out.sql ../cfg_050.py
```

`parse_udst.py` reads the newest "YYYY-YYYY Study Plan" section, one tab per year, and
records each course's year, term within the year, credits and elective pool
("select 1 of N"). New programs need an entry in a `cfg_*.py` mapping. Put new plans in a
**new** migration; don't edit applied ones.
