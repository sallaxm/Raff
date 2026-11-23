-- 051_seed_udst_diplomas_and_masters.sql
-- Official UDST diploma, advanced diploma and master's study plans (2026-2027),
-- taken from the program pages linked at https://www.udst.edu.qa/admissions/all-programs :
-- 29 programs, 467 courses, 799 program-course links.
--
-- Also adds majors.level (bachelor / diploma / advanced-diploma / master) so the
-- site can group programs by level.
--
-- Same compact format as 050, plus a 9th "level" field per program line.
-- Existing course titles are kept (bachelor plans are the reference); only new
-- courses are added and missing credit hours filled in.

alter table public.majors add column if not exists level text;

update public.majors
set level = 'bachelor'
where level is null and (name ilike 'bachelor%' or name ilike 'post-diploma%' or name ilike 'post-practical%');

create temporary table _udst_courses as
select split_part(l, '|', 1) as code,
       split_part(l, '|', 2) as name,
       nullif(split_part(l, '|', 3), '')::int as credits
from regexp_split_to_table($c$
ACCT1001|Financial Accounting|3
ACCT2001|Managerial Accounting|3
ACCT2003|Intermediate Financial Accounting I|3
ACCT2005|Intermediate Financial Accounting II|3
ACCT2010|Quantitative Methods for Decision Making|3
ACCT3001|Advanced Costing & Managerial Accounting|3
ACCT3005|Accounting Information Systems|3
ACCT3007|Financial Reporting & Analysis|3
ACCT3009|Financial Modelling|3
AEAC2101|Industrial Process Instrumentation|3
AEAC2102|Industrial Automation|2
AEAC2103|Control Strategies|2
AEAC2113|PLC Programming & Control|2
AEAC2201|Industrial Process Instrumentation (Lab)|1
AEAC2202|Industrial Automation (Lab)|1
AEAC2203|Control Strategies (Lab)|1
AEAC2213|PLC Programming & Control (Lab)|1
AEAC3101|Embedded Systems|2
AEAC3102|Safety Shutdown & Instrumented Systems|2
AEAC3111|Process Control Applications|2
AEAC3112|DCS & SCADA|3
AEAC3122|Industrial Process Analysis|2
AEAC3201|Embedded Systems (Lab)|2
AEAC3202|Safety Shutdown & Instrumented Systems (Lab)|1
AEAC3211|Process Control Applications (Lab)|1
AEAC3212|DCS & SCADA (Lab)|1
AEAC3222|Industrial Process Analysis (Lab)|1
AEAC3321|Technology Capstone Project I|0
AEAC3332|Technology Capstone Project II|3
AECE1200|Introduction to Construction Engineering, Materials & Methods|3
AECE1230|Mechanical & Electrical Systems in Construction|3
AECE1340|Basic Construction Safety|3
AECE2100|Construction Documents & Codes|2
AECE2110|Principles of Engineering Economy|2
AECE2120|Statics|3
AECE2130|Principles of Geomatics|3
AECE2131|Principles of Geomatics (Lab)|1
AECE2140|Project Drawings & Graphics|1
AECE2210|Engineering Geology|3
AECE2220|Construction Equipment & Machineries|3
AECE2230|Strength of Construction Materials|3
AECE2231|Strength of Construction Materials (Lab)|1
AECE3100|Soil Mechanics|3
AECE3101|Soil Mechanics (Lab)|1
AECE3120|Construction Planning & Scheduling|3
AECE3210|Construction Cost Estimation|3
AECE3220|Built-Facility Maintenance & Repair|3
AECE3230|Structural Engineering|3
AECE3321|Technology Capstone Project I|0
AECE3332|Technology Capstone Project II|3
AECH1100|Environmental Awareness & Ethics|2
AECH1103|Industrial Process Overview|2
AECH1112|Health, Safety & Environment in the Process Industries|2
AECH1201|Basic Engineering Calculations|1
AECH2103|Leadership & Management Principles|2
AECH2111|Principles of Chemical Engineering I|3
AECH2112|Sustainability & Renewable Energy|3
AECH2113|Quality Assurance|2
AECH2121|Process Control Systems|3
AECH2122|Principles of Chemical Engineering II|2
AECH2142|Basic Fluid Mechanics & Heat Transfer|2
AECH2241|Chemical & Processing Plant Operation|2
AECH2251|Instrumentation & Control (Lab)|1
AECH2331|Process Equipment|4
AECH2332|Chemical & Processing Plant Troubleshooting|2
AECH3101|Fluid Mechanics|3
AECH3132|Chemical Reaction Engineering|3
AECH3222|Fluid Mechanics & Heat Transfer (Lab)|1
AECH3302|Thermodynamics|3
AECH3321|Process Unit Design|4
AECH3331|Technology Capstone I|0
AECH3332|Technology Capstone II|3
AECH4221|Chemical Reaction Engineering (Lab)|1
AECH4232|Materials & Corrosion|4
AECH6101|Safe Design & Operations|3
AECH6102|Advanced Process Safety Management|3
AECH6111|Chemical Process Safety & Hazardous Materials|3
AECH6112|Emergency Response & Crisis Management|3
AECH6121|Hazard Identification & Risk Management|3
AECH6122|Ethical, Environmental & Legal Compliance|3
AECH7102|Experimental Design & Data Analytics|3
AECH7111|Safety Culture, Human Centered Design & Stress Management|3
AECH7201|Process Safety Thesis I|0
AECH7301|Emission Measurement Techniques & Exposure Limits|3
AECH7302|Process Safety Thesis II|6
AEEL1100|Fundamentals of Electricity|2
AEEL1101|Fundamentals of Electricity I|3
AEEL1102|Fundamentals of Electricity II|3
AEEL1200|Fundamentals of Electricity (Lab)|1
AEEL1201|Fundamentals of Electricity I (Lab)|1
AEEL1202|Fundamentals of Electricity II (Lab)|1
AEEL2201|Electronic Fabrication Practices|2
AEEP2102|Power Systems I|3
AEEP2103|Facilities & Electrical Systems|2
AEEP2111|Electrical Machines|3
AEEP2112|Electrical Practices|2
AEEP2113|HV Equipment Testing & Maintenance|2
AEEP2122|Motor Controls & Drives|3
AEEP2202|Power Systems I (Lab)|1
AEEP2203|Facilities & Electrical Systems (Lab)|1
AEEP2211|Electrical Machines (Lab)|1
AEEP2212|Electrical Practices (Lab)|2
AEEP2213|HV Equipment Testing & Maintenance (Lab)|1
AEEP2222|Motor Controls & Drives (Lab)|1
AEEP2301|Applied Programming|2
AEEP3101|Introduction to Embedded Systems|2
AEEP3102|Power Electronics|3
AEEP3111|Power Systems II|3
AEEP3122|Renewable Energy Conversion I|3
AEEP3201|Introduction to Embedded Systems (Lab)|2
AEEP3202|Power Electronics (Lab)|1
AEEP3211|Power Systems II (Lab)|1
AEEP3222|Renewable Energy Conversion I (Lab)|1
AEEP3312|Technology Capstone Project II|3
AEEP3321|Technology Capstone Project I|0
AEMA1102|Health & Safety in the Workplace|2
AEMA1113|Materials Science|2
AEMA1213|Materials Science (Lab)|1
AEMA1303|Machine Shop Practices|2
AEMA1312|Engineering Graphics|3
AEMA2101|Welding Fundamentals|1
AEMA2102|Power Plant Components|2
AEMA2103|Principles of Maintenance|2
AEMA2112|Rotating Equipment Maintenance|2
AEMA2113|Hydraulics & Pneumatics|2
AEMA2121|Materials & Processes|2
AEMA2122|Non-Destructive Testing|2
AEMA2131|Industrial Maintenance|2
AEMA2201|Welding Fundamentals (Lab)|1
AEMA2202|Power Plant Components (Lab)|1
AEMA2203|Principles of Maintenance (Lab)|1
AEMA2213|Hydraulics & Pneumatics (Lab)|1
AEMA2221|Materials & Processes (Lab)|1
AEMA2222|Non-Destructive Testing (Lab)|1
AEMA2231|Industrial Maintenance Mechanics (Lab)|1
AEMA2232|Rotating Equipment Maintenance (Lab)|1
AEMA2311|Computer Aided Design I|3
AEMA3121|Fluid Mechanics|2
AEMA3142|Applied Heat Transfer|3
AEMA3221|Fluid Mechanics (Lab)|1
AEMA3301|Mechanics, Statics & Dynamics|3
AEMA3302|Strength of Materials|3
AEMA3311|Computer Aided Design II|3
AEMA3321|Technology Capstone Project I|0
AEMA3322|Maintenance Engineering|3
AEMA3332|Technology Capstone Project II|3
AEMA4312|CNC & CAM|3
AEPC1203|Basic Instrumentation|2
AETN1102|Network Fundamentals|3
AETN1112|Digital Electronics|3
AETN1202|Network Fundamentals (Lab)|1
AETN1212|Digital Electronics (Lab)|1
AETN2101|Analog Electronics|3
AETN2103|Microprocessors & Microcontrollers|2
AETN2111|Network Switching & Routing|3
AETN2112|Enterprise Networks|3
AETN2121|Analog & Digital Communication|3
AETN2122|Wireless Communication Systems|3
AETN2201|Analog Electronics (Lab)|1
AETN2203|Microprocessors & Microcontrollers (Lab)|2
AETN2211|Network Switching & Routing (Lab)|1
AETN2212|Enterprise Networks (Lab)|1
AETN2221|Analog & Digital Communication (Lab)|1
AETN2222|Wireless Communication Systems (Lab)|1
AETN2302|Applied Programming I|2
AETN3101|Cyber Security|3
AETN3102|Antennas & Wave Propagation|2
AETN3111|Applied Electromagnetics|3
AETN3201|Cyber Security (Lab)|1
AETN3202|Antennas & Wave Propagation (Lab)|1
AETN3222|Artificial Intelligence & Data Science|2
AETN3331|Technology Capstone I|0
AETN3332|Technology Capstone II|3
AETN4112|Enterprise Unified Communications|3
AETN4212|Enterprise Unified Communications (Lab)|1
AHHG2030|Biostatistics|3
AICC5101|Theories of Computing|3
AICC5102|Principles of AI|3
AICC5103|Principles of Cybersecurity|3
AICC5201|Machine Learning & Deep Learning|3
AICC5202|Cognitive Computing|3
AICC5203|Cybersecurity Attacks & Defenses|3
AICC5204|Research Methods & Professional Development|3
AICC6101|Cognitive Cybersecurity|3
AICC6102|AI Systems Engineering|3
AICC6103|Computing Seminar|1
AICC6104|Computing Research Thesis Project I|3
AICC6110|Selected Topics for Computing Graduation Project|3
AICC6204|Computing Research Thesis II|3
AICC6210|Computing Graduation Project|3
BIOL1001|Inquiry-Based Biology|3
BIOL1002|Introduction to Botany|3
BIOL1003|Introduction to Ecology|3
BIOL1030|Biochemistry & Microbiology|3
BIOL1031|Biochemistry & Microbiology (Lab)|1
BIOL1070|Microbiology and Food Quality|3
BIOL1100|General Biology|3
BIOL1101|General Biology (Lab)|1
BIOL1110|Anatomy & Physiology I|3
BIOL1111|Anatomy & Physiology I (Lab)|1
BIOL1210|Anatomy & Physiology II|3
BIOL1211|Anatomy & Physiology II LAB|1
BIOL1230|Animal Anatomy & Physiology I|3
BIOL1231|Animal Anatomy & Physiology I (Lab)|1
BIOL1310|Introduction to Pathophysiology|3
BIOL1330|Animal Anatomy & Physiology II|3
BIOL1331|Animal Anatomy & Physiology II (Lab)|1
BIOL2010|Microbiology|3
BIOL2011|Microbiology (Lab)|1
BKFT1001|Principles of Finance|3
BUSG2002|Project Management|3
BUSG2010|Qatar Business Law|3
BUSG2301|Work Placement|9
BUSG5010|Advanced Business Research Methods|3
BUSG5020|Decision Making & Negotiation|3
BUSG5030|Corporate Social Responsibility & Governance|3
CHEM1010|General Chemistry I|3
CHEM1011|General Chemistry I (Lab)|1
CHEM1020|General Chemistry II|3
CHEM1021|General Chemistry II (Lab)|1
CHEM1030|Health Sciences Chemistry|3
CHEM1031|Health Sciences Chemistry (Lab)|1
CHEM1040|Applied Science|3
CHEM1041|Applied Science (Lab)|1
CHEM1050|Health Sciences Chemistry|3
CHEM1051|Health Sciences Chemistry (Lab)|1
CHEM2010|Organic Chemistry for Engineers|3
CHEM2011|Organic Chemistry for Engineers (Lab)|1
CHEM3010|Petrochemistry|2
CHEM3011|Petrochemistry (Lab)|1
CHEM3050|Principles of Atomic and Molecular Spectroscopy|3
COMM1010|English Communication I|3
COMM1020|English Communication II|3
COMM3010|Research & Reporting|3
COMP1401|Introduction to Computers & Information Systems|3
COMP2201|Technical Project|3
COMP2301|Work Placement|9
DACS2201|Introduction to Data & Cyber Security|3
DMET5010|Contemporary Issues in Digital Marketing|3
DMET5020|Marketing Management & Digital Strategies|3
DMET5030|Digital Media & Viral Marketing|3
DMET6010|E-Commerce & Entrepreneurship|3
DMET6020|Business Models in the Digital Age|3
DMET6091|Entrepreneurial Marketing|3
DMET6092|Strategic Brand Management|3
DMET6093|Technology-Driven Decision-Making|3
DMET6099|Digital Marketing & Entrepreneurship Research Project|0
DSAI5101|Principles of Data Science & Machine Learning|3
DSAI5102|Data Architecture & Engineering|3
DSAI5201|Data Governance & Responsible AI|3
DSAI5202|Advanced Deep Learning|3
DSAI6101|Advanced Natural Language Processing|3
DSAI6102|Advanced Computer Vision|3
DSAI6103|Advanced Reinforcement Learning|3
DSAI6201|Business Intelligence & Data Analytics|3
DSAI6202|Software Engineering for Machine Learning Systems|3
DSAI6203|AI in Healthcare|3
DSAI6205|Generative AI & LLMs|3
EASC1001|Soil Science|3
ECON2010|Business Economics|3
EDPR5210|School/Industry Experience I|3
EDPR6220|Teaching Practicum|6
EDUC5203|Educational Psychology|3
EDUC5210|Learning Theories in STEM Education|3
EDUC5220|Learning Environment Management|3
EDUC5230|Methods in STEM Education|3
EDUC5240|Technology in STEM Education|3
EDUC5250|Assessment in STEM Education|3
EDUC6270|Teaching STEM in Arabic & International School Settings|3
EDUC6310|Foundations of STEM Education & Technical & Vocational Education & Training (TVET)|3
EDUC6320|Mathematical Modeling: Theoretical Frameworks and Applications|3
EDUC6330|Project-based Learning & Socioscientific Issues|3
EDUC6340|Integrating Computational Thinking into STEM Curricula|3
EDUC6351|Special Topics: Teaching STEM in the IB Diploma Programme|3
EDUC6352|Special Topics: Teaching STEM in the IB Middle Years Programme|3
EDUC6353|Special Topics: Teaching STEM in the IB Primary Years Programme|3
EDUC6354|Special Topics: The A for Arts in STEAM|3
EDUC6355|Special Topics: STEM Education Policy in the Gulf Cooperation Council|3
EDUC6360|Quantitative Research Methods in STEM Education|3
EDUC6370|Qualitative Research Methods|3
EDUC7301|Thesis 1|0
EDUC7302|Thesis 2|6
EFFL1001|Effective Learning|3
EFFL1002|Applied & Experiential Learning|3
EFFL1003|Experiential Learning & Entrepreneurship|3
HCMT1001|Introduction to Healthcare Management|3
HCMT2001|Healthcare Operations Management|3
HCMT3001|Health Policy|3
HCMT3002|Healthcare Information Governance|3
HCMT3003|Healthcare Quality Management|3
HCMT3004|Health Economics|3
HCMT3005|Healthcare Informatics|3
HCMT3006|Healthcare Risk Management|3
HRMG1001|Principles of Human Resource Management|3
HRMG2020|Employee Relations|3
HRMG3010|Recruitment & Selection|3
HRMG3020|Qatar Employment Law|3
HRMG3030|Occupational Health & Safety|3
HRMG3040|Performance Management|3
HRMG3050|Learning & Development|3
HRMG4020|Compensation & Benefits|3
HRMG5010|Contemporary Issues in Human Resources|3
HRMG5020|People Analytics|3
HRMG5030|Leading Strategic HR Transformation|3
HRMG5040|Digital Human Resources|3
HRMG5099|Human Resource Management Research Project|0
HRMG6081|Global Talent Management|3
HRMG6082|Culture & Diversity Management|3
HRMG6083|Managing Change in Multinational Corporations|3
HRMG6091|Organizational Development & Change|3
HRMG6092|Talent Management & Development|3
HRMG6093|Design Thinking & Creativity|3
HSHG2080|Ethics in Healthcare|3
HSPT1101|Pharmaceutical Calculations I|3
HSPT1201|Pharmacy Computer Systems|3
HSPT1202|Pharmaceutical Calculations II|3
HSPT1203|Pharmacy Management & Inventory Control|3
HSPT1301|Pharmacy Regulations & Professionalism|3
HSPT2101|Prescription Processing|4
HSPT2102|Pharmacology I|5
HSPT2103|Community Pharmacy Practice|4
HSPT2104|Medication Safety, Quality & Drug Reconciliation|3
HSPT2201|Hospital Pharmacy Practice|3
HSPT2202|Aseptic Technique|4
HSPT2203|Pharmacology II|5
HSPT2204|Nonsterile Compounding|3
HSPT2300|Clinical Work Term|6
HSVS1000|Introduction to Veterinary Technology|1
HSVS1110|Animal Production & Health Systems I|3
HSVS1200|Animal Welfare & Ethics|3
HSVS1210|Animal Production & Health Systems II|3
HSVS1220|Laboratory Skills & Biosafety|2
HSVS1320|Animal Nutrition & Pharmacology|3
HSVS1350|Work Term I|1
HSVS2010|Animal Behavior & Handling Techniques|3
HSVS2100|Fundamentals of Disease in Animals|3
HSVS2110|Animal Pathology - Foundations of Necropsy Procedures|3
HSVS2120|Surgical Nursing for Veterinary Technicians|3
HSVS2130|Veterinary Emergencies & First Aid|2
HSVS2140|Exotic Animal Handling|2
HSVS2210|Principles of Anesthesia|3
HSVS2220|Small & Large Animal Nursing|3
HSVS2230|Animal Imaging|3
HSVS2240|Animal Dentistry|3
HSVS2250|Work Term II|2
HSVS2350|Work Term III|4
INFS1101|Introduction to Computing & Problem Solving|3
INFS1201|Computer Programming|4
INFS2101|Web Technologies I|3
INFS2201|Database Management Systems|3
INFS3102|Object Oriented Programming|3
INFS3103|Systems Analysis & Design|3
INFS3201|Web Technologies II|3
INFS3203|Systems Deployment & Implementation|3
INFT1201|Computer Hardware|4
INFT2101|Networking I|4
INFT2102|Mathematics for IT|3
INFT2103|Network Implementation|3
INFT2104|System Administration|3
INFT2202|Linux Foundations|3
INFT2203|Network Design|3
INFT2204|Enterprise Services|3
INFT3301|IT Service Management|3
MACC5110|Advanced Diagnostics|5
MACC5120|Advanced Patient Management I|5
MACC5210|Research Design & Methods|2
MACC5220|Critical Care Transport|4
MACC5230|Advanced Clinical Integration I|3
MACC5300|Intensive Care Practicum|3
MACC6100|Graduate Research Project I|2
MACC6110|Advanced Patient Management II|4
MACC6120|Extended Care Principles & Practices|2
MACC6200|Graduate Research Project II|2
MACC6210|Advanced Clinical Integration II|4
MACC6300|Critical Care Paramedicine Preceptorship|6
MADC5000|Diabetes Care Calculations|1
MADC5110|Organization of Diabetes Care|3
MADC5120|Teaching & Learning Practice in DSME Programs|4
MADC5130|Diabetes Prevention & Health Promotion|3
MADC5140|Clinical Aspects of Diabetes Care|3
MADC5150|Diabetes Management I: Nutrition & Physical Activity|3
MADC5210|Diabetes Management II: Pharmacotherapy & Technology|3
MADC5220|Pediatric & Adolescent Diabetes Education|3
MADC5230|Diabetes in Special Populations|3
MADC5240|Microvascular & Other Complications|3
MADC5250|Cardiometabolic Disorders|3
MADC5310|Diabetes Educator Practicum|5
MADC6110|Research Methods in Diabetes Care & Management I|3
MADC6220|Research Methods in Diabetes Care & Management II - Thesis or Professional Project|3
MADC6330|Research Methods in Diabetes Care & Management III - Thesis or Professional Project|1
MATH1010|Algebra & Trigonometry|3
MATH1020|Pre-Calculus|3
MATH1030|Calculus I|3
MATH1040|Statistics|3
MATH1050|Linear Algebra|3
MATH1060|Numerical Problem Solving|3
MATH1070|Applied Mathematics|3
MATH2002|Quantitative Designs & Statistics|3
MATH2010|Calculus II|3
MATH2020|Numerical Methods|3
MATH3010|Multivariable Calculus|3
MATH3020|Differential Equations|3
MATH3030|Probability & Statistics|3
MGMT2010|Organizational Behavior|3
MIDW5110|Anatomy & Physiology in Midwifery|2
MIDW5120|Interpreting Professional Midwifery Practice|2
MIDW5130|Applied Newborn Care & Wellbeing|2
MIDW5140|Applied Woman-Centered Care & Physiological Birth|2
MIDW5150|Research & Evidence Informed Practice|2
MIDW5210|Concepts of Maternal Complexities|2
MIDW5220|Concepts of Newborn Complexities|2
MIDW5230|Management of Maternal & Newborn Complexities|1
MIDW5240|Leadership & Scholarship in Midwifery|2
MIDW5250|Public Health & Policy in Midwifery|2
MIDW6110|Advancing Midwifery Practice|6
MIDW6210|Consolidation of Midwifery Practice|0
MRKT1001|Principles of Marketing|3
MRKT2002|Marketing Research|3
MRKT2003|Fundamentals of Digital Marketing|3
MRKT3007|Professional Selling|3
MRKT3008|Digital Marketing Communications|3
MRKT3009|Marketing Analytics & Data Mining|3
MRKT3011|Branding in the Digital Age|3
MRKT3104|Consumer Behavior in the Digital Age|3
MRKT3105|Marketing Content & Media Management|3
MSAF6100|Empirical Research Methods|3
MSAF6101|Financial Statement Preparation & Analysis|3
MSAF6105|Financial Management|3
MSAF6201|International Financial Reporting|3
MSAF6205|Advanced Corporate Finance|3
MSAF6211|Advanced Management Accounting|3
MSAF6301|Contemporary Issues in Accounting & Financial Economics|3
MSAF6305|Investments & Portfolio Management|3
MSAF6315|Advanced Asset Pricing|3
MSAF6325|Derivatives & Alternative Investments|3
MSAF6400|Accounting & Finance Research Project|6
NUPN1010|Introduction to Practical Nursing|3
NUPN2010|Trends & Leadership for Practical Nursing|2
NUPN2020|Theoretical Perspectives of Primary Care for Families|3
NUPN2030|Theoretical Perspectives of Maternal & Newborn Health|2
NUPN2040|Theoretical Perspectives of Pediatric Health|2
NUPN2050|Practical Nursing Practice for Families|3
NUPN2060|Practical Nursing Consolidation|5
NURS1010|Introduction to Pathophysiology & Pharmacotherapeutics|4
NURS1020|Nursing Therapeutics I|4
NURS1021|Nursing Therapeutics II|4
NURS1030|Introduction to Health Assessment|4
NURS1040|Health & Health Systems|4
NURS1050|Person & Family Centered Practice|3
NURS2010|Theoretical Perspectives of Acute Health|6
NURS2020|Alterations & Therapeutics I|4
NURS2021|Alterations & Therapeutics II|4
NURS2050|Nursing Practice for Acute Health|3
PHYS1000|Applied Physics|3
PHYS1001|Applied Physics (Lab)|1
PHYS1020|General Physics I|3
PHYS1021|General Physics I (Lab)|1
PHYS1030|Health Sciences Physics|3
PHYS1031|Health Sciences Physics (Lab)|1
PHYS1040|General Physics II|3
PHYS1041|General Physics II (Lab)|1
PHYS1050|Healthcare Physics Concepts & Applications|3
PHYS1130|Medical Imaging Physics|3
PHYS2001|Introduction to Nanoscience|3
RSST3001|Research & Statistics|3
SCIE1001|Science & Its Applications|3
SCIE1002|Science & the Environment|3
$c$, '\n') as l
where l <> '';

create temporary table _udst_programs as
select split_part(l, '|', 1) as slug,
       split_part(l, '|', 2) as college,
       split_part(l, '|', 3) as name,
       nullif(split_part(l, '|', 4), '') as short_name,
       split_part(l, '|', 5) as source_url,
       nullif(split_part(l, '|', 6), '') as plan_year,
       string_to_array(nullif(split_part(l, '|', 7), ''), '~') as groups,
       split_part(l, '|', 8) as links,
       nullif(split_part(l, '|', 9), '') as level
from regexp_split_to_table($p$
adv-dip-automation-control|engineering-and-technology|Advanced Diploma in Automation and Control Engineering Technology|Adv. Dip. ACET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma-automation|2026-2027|General Education Requirement: select 1 of 3|AECH1201:1:1:0,AEEL1101:1:1:0,AEEL1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AEEL1102:1:2:0,AEEL1202:1:2:0,AETN1102:1:2:0,AETN1202:1:2:0,AETN1112:1:2:0,AETN1212:1:2:0,COMM1020:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AEAC2101:2:1:0,AEAC2201:2:1:0,AEEP2111:2:1:0,AEEP2211:2:1:0,AETN2101:2:1:0,AETN2201:2:1:0,MATH1030:2:1:0,AEAC2102:2:2:0,AEAC2202:2:2:0,AEEP2301:2:2:0,AEEP2122:2:2:0,AEEP2222:2:2:0,CHEM1010:2:2:0,CHEM1011:2:2:0,MATH2010:2:2:0,AEAC2103:2:3:0,AEAC2203:2:3:0,AEAC2113:2:3:0,AEAC2213:2:3:0,AECH2112:3:1:0,AEAC3101:3:1:0,AEAC3201:3:1:0,AEAC3111:3:1:0,AEAC3211:3:1:0,AEAC3321:3:1:0,MATH3030:3:1:0,BIOL1001:3:1:1,BIOL1002:3:1:1,BIOL1003:3:1:1,AEAC3122:3:2:0,AEAC3222:3:2:0,AEAC3102:3:2:0,AEAC3202:3:2:0,AEAC3112:3:2:0,AEAC3212:3:2:0,AEAC3332:3:2:0|advanced-diploma
adv-dip-chemical-processing|engineering-and-technology|Advanced Diploma in Chemical and Processing Engineering Technology|Adv. Dip. CPET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma-chemical-and|2026-2027||AECH1201:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AECH1112:1:2:0,AEEL1100:1:2:0,AEEL1200:1:2:0,AEMA1312:1:2:0,CHEM1020:1:2:0,CHEM1021:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AECH1103:1:3:0,AEPC1203:1:3:0,AECH2111:2:1:0,AECH2121:2:1:0,AECH2241:2:1:0,AECH2251:2:1:0,AECH2331:2:1:0,MATH1030:2:1:0,AECH2122:2:2:0,AECH2142:2:2:0,AECH2332:2:2:0,CHEM2010:2:2:0,CHEM2011:2:2:0,COMM1020:2:2:0,MATH2010:2:2:0,AECH2103:2:3:0,AECH2112:2:3:0,AECH2113:2:3:0,AECH3132:3:1:0,AECH3101:3:1:0,AECH3321:3:1:0,AECH3331:3:1:0,MATH3030:3:1:0,AECH3302:3:2:0,AECH3332:3:2:0,AECH4221:3:2:0,AECH4232:3:2:0,AEMA3142:3:2:0,AECH3222:3:3:0,AETN2302:3:3:0|advanced-diploma
adv-dip-construction|engineering-and-technology|Advanced Diploma in Construction Engineering Technology|Adv. Dip. CET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma-construction|2026-2027|General Education Requirement: select 1 of 3|AECH1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AECE1200:1:2:0,AECE1230:1:2:0,AECH1100:1:2:0,AEEL1100:1:2:0,AEEL1200:1:2:0,CHEM1010:1:2:0,CHEM1011:1:2:0,MATH1020:1:2:0,AECE1340:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AECE2100:2:1:0,AECE2110:2:1:0,AECE2120:2:1:0,AECE2130:2:1:0,AECE2131:2:1:0,AECE2140:2:1:0,MATH1030:2:1:0,AECE2210:2:2:0,AECE2220:2:2:0,AECE2230:2:2:0,AECE2231:2:2:0,COMM1020:2:2:0,MATH2010:2:2:0,AECH2103:2:3:0,AETN2302:2:3:0,AECE3100:3:1:0,AECE3101:3:1:0,AECE3120:3:1:0,AECE3321:3:1:0,AEMA3121:3:1:0,AEMA3221:3:1:0,MATH3030:3:1:0,BIOL1001:3:1:1,BIOL1002:3:1:1,BIOL1003:3:1:1,AECE3210:3:2:0,AECE3332:3:2:0,AECE3220:3:2:0,AECE3230:3:2:0,AECH2112:3:2:0,AECH2113:3:2:0|advanced-diploma
adv-dip-electrical-power-renewable|engineering-and-technology|Advanced Diploma in Electrical Power and Renewable Energy Engineering Technology|Adv. Dip. EPREET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma-electrical|2026-2027||AECH1201:1:1:0,AEEL1101:1:1:0,AEEL1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AEEL1102:1:2:0,AEEL1202:1:2:0,AETN1102:1:2:0,AETN1202:1:2:0,AETN1112:1:2:0,AETN1212:1:2:0,COMM1020:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AEEP2111:2:1:0,AEEP2211:2:1:0,AEEP2301:2:1:0,AETN2101:2:1:0,AETN2201:2:1:0,CHEM1010:2:1:0,CHEM1011:2:1:0,MATH1030:2:1:0,AEEP2102:2:2:0,AEEP2202:2:2:0,AEEP2112:2:2:0,AEEP2212:2:2:0,AEEP2122:2:2:0,AEEP2222:2:2:0,MATH2010:2:2:0,AEEP2103:2:3:0,AEEP2203:2:3:0,AEEP2113:2:3:0,AEEP2213:2:3:0,AECH2112:3:1:0,AEAC2113:3:1:0,AEAC2213:3:1:0,AEEP3101:3:1:0,AEEP3201:3:1:0,AEEP3111:3:1:0,AEEP3211:3:1:0,AEEP3321:3:1:0,AEEP3102:3:2:0,AEEP3202:3:2:0,AEEP3122:3:2:0,AEEP3222:3:2:0,AEEP3312:3:2:0,MATH3030:3:2:0|advanced-diploma
adv-dip-mechanical-maintenance|engineering-and-technology|Advanced Diploma in Maintenance Engineering Technology|Adv. Dip. MET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma-maintenance|2026-2027||AECH1201:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AEEL1100:1:2:0,AEEL1200:1:2:0,AECH1100:1:2:0,AEMA1102:1:2:0,AEMA1312:1:2:0,COMM1020:1:2:0,MATH1020:1:2:0,AEMA1113:1:3:0,AEMA1213:1:3:0,AEMA1303:1:3:0,AEPC1203:1:3:0,AECH2103:2:1:0,AEMA2101:2:1:0,AEMA2201:2:1:0,AEMA2121:2:1:0,AEMA2221:2:1:0,AEMA2131:2:1:0,AEMA2231:2:1:0,AEMA2311:2:1:0,MATH1030:2:1:0,AECH2112:2:2:0,AEMA2102:2:2:0,AEMA2202:2:2:0,AEMA2112:2:2:0,AEMA2232:2:2:0,AEMA2122:2:2:0,AEMA2222:2:2:0,MATH2010:2:2:0,AEMA2103:2:3:0,AEMA2203:2:3:0,AEMA2113:2:3:0,AEMA2213:2:3:0,AEMA3301:3:1:0,AEMA3311:3:1:0,AEMA3321:3:1:0,COMM3010:3:1:0,MATH3030:3:1:0,AECH3302:3:2:0,AEMA3121:3:2:0,AEMA3221:3:2:0,AEMA3302:3:2:0,AEMA3332:3:2:0,AECH2113:3:3:0,AEMA3322:3:3:0,AEMA4312:3:3:0|advanced-diploma
adv-dip-telecom-network|engineering-and-technology|Advanced Diploma in Telecommunications and Network Engineering Technology|Adv. Dip. TNET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/advanced-diploma|2026-2027||AECH1201:1:1:0,AEEL1101:1:1:0,AEEL1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AEEL1102:1:2:0,AEEL1202:1:2:0,AETN1102:1:2:0,AETN1202:1:2:0,AETN1112:1:2:0,AETN1212:1:2:0,COMM1020:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AEEL2201:2:1:0,AETN2101:2:1:0,AETN2201:2:1:0,AETN2111:2:1:0,AETN2211:2:1:0,AETN2121:2:1:0,AETN2221:2:1:0,MATH1030:2:1:0,AECH2103:2:2:0,AETN2112:2:2:0,AETN2212:2:2:0,AETN2122:2:2:0,AETN2222:2:2:0,AETN2302:2:2:0,MATH2010:2:2:0,AETN2103:2:3:0,AETN2203:2:3:0,AETN3101:3:1:0,AETN3201:3:1:0,AETN3111:3:1:0,AETN3222:3:1:0,AETN3331:3:1:0,COMM3010:3:1:0,AECH2112:3:2:0,AETN3102:3:2:0,AETN3202:3:2:0,AETN3332:3:2:0,AETN4112:3:2:0,AETN4212:3:2:0|advanced-diploma
dip-accounting|business|Diploma in Accounting|Dip. Acc|https://www.udst.edu.qa/academic/our-colleges/college-business/diploma-accounting-dip-acc|2026-2027|General Education Requirement: select 1 of 57|ACCT1001:1:1:0,COMM1010:1:1:0,EFFL1003:1:1:0,MATH1070:1:1:0,BKFT1001:1:2:0,COMM1020:1:2:0,MRKT1001:1:2:0,BIOL1001:1:2:1,BIOL1002:1:2:1,BIOL1003:1:2:1,BIOL1030:1:2:1,BIOL1031:1:2:1,BIOL1070:1:2:1,BIOL1110:1:2:1,BIOL1111:1:2:1,BIOL1210:1:2:1,BIOL1211:1:2:1,BIOL1310:1:2:1,BIOL2010:1:2:1,BIOL2011:1:2:1,CHEM1010:1:2:1,CHEM1011:1:2:1,CHEM1020:1:2:1,CHEM1021:1:2:1,CHEM1030:1:2:1,CHEM1031:1:2:1,CHEM1040:1:2:1,CHEM1041:1:2:1,CHEM1050:1:2:1,CHEM1051:1:2:1,CHEM2010:1:2:1,CHEM2011:1:2:1,CHEM3010:1:2:1,CHEM3011:1:2:1,CHEM3050:1:2:1,COMP1401:1:2:1,EASC1001:1:2:1,INFT2102:1:2:1,MATH1010:1:2:1,MATH1020:1:2:1,MATH1030:1:2:1,MATH1040:1:2:1,MATH1050:1:2:1,MATH1060:1:2:1,MATH2002:1:2:1,MATH2010:1:2:1,MATH2020:1:2:1,MATH3010:1:2:1,MATH3020:1:2:1,MATH3030:1:2:1,PHYS1000:1:2:1,PHYS1001:1:2:1,PHYS1020:1:2:1,PHYS1021:1:2:1,PHYS1030:1:2:1,PHYS1031:1:2:1,PHYS1040:1:2:1,PHYS1041:1:2:1,PHYS1050:1:2:1,PHYS1130:1:2:1,PHYS2001:1:2:1,SCIE1001:1:2:1,SCIE1002:1:2:1,HRMG1001:1:3:0,ACCT2001:2:1:0,ACCT2003:2:1:0,ACCT2010:2:1:0,BUSG2010:2:1:0,ECON2010:2:1:0,ACCT2005:2:2:0,ACCT3001:2:2:0,ACCT3005:2:2:0,ACCT3007:2:2:0,ACCT3009:2:2:0,BUSG2301:2:3:0|diploma
dip-animal-health-veterinary-sciences|health-sciences|Diploma in Animal Health & Veterinary Sciences|Dip.AHVS|https://www.udst.edu.qa/diploma-animal-health-veterinary-sciences-dipahvs|2026-2027||BIOL1100:1:1:0,BIOL1101:1:1:0,COMM1010:1:1:0,HSVS1000:1:1:0,HSVS1110:1:1:0,MATH1010:1:1:0,BIOL1030:1:2:0,BIOL1031:1:2:0,BIOL1230:1:2:0,BIOL1231:1:2:0,HSVS1200:1:2:0,HSVS1210:1:2:0,HSVS1220:1:2:0,BIOL1330:1:3:0,BIOL1331:1:3:0,HSVS1320:1:3:0,HSVS1350:1:3:0,HSVS2010:2:1:0,HSVS2100:2:1:0,HSVS2110:2:1:0,HSVS2120:2:1:0,HSVS2130:2:1:0,HSVS2140:2:1:0,HSVS2210:2:2:0,HSVS2220:2:2:0,HSVS2230:2:2:0,HSVS2240:2:2:0,HSVS2250:2:2:0,HSVS2350:2:3:0|diploma
dip-automation-control|engineering-and-technology|Diploma in Automation and Control Engineering Technology|Dip. ACET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/diploma-automation-and|2026-2027|Effective & Experiential Learning Elective: Select 1 of 2|AECH1201:1:1:0,AEEL1101:1:1:0,AEEL1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,AEEL1102:1:2:0,AEEL1202:1:2:0,AETN1102:1:2:0,AETN1202:1:2:0,AETN1112:1:2:0,AETN1212:1:2:0,COMM1020:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AEAC2101:2:1:0,AEAC2201:2:1:0,AEEP2111:2:1:0,AEEP2211:2:1:0,AETN2101:2:1:0,AETN2201:2:1:0,AEAC2102:2:2:0,AEAC2202:2:2:0,AEEP2122:2:2:0,AEEP2222:2:2:0,AEEP2301:2:2:0,CHEM1010:2:2:0,CHEM1011:2:2:0,AEAC2103:2:3:0,AEAC2203:2:3:0,AEAC2113:2:3:0,AEAC2213:2:3:0|diploma
dip-chemical-processing|engineering-and-technology|Diploma in Chemical and Processing Engineering Technology|Dip. CPET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/diploma-chemical-and|2026-2027||AECH1201:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1000:1:1:0,PHYS1001:1:1:0,EFFL1003:1:1:0,AECH1112:1:2:0,AEEL1100:1:2:0,AEEL1200:1:2:0,AEMA1312:1:2:0,CHEM1020:1:2:0,CHEM1021:1:2:0,MATH1020:1:2:0,AECH1100:1:3:0,AECH1103:1:3:0,AEPC1203:1:3:0,AECH2111:2:1:0,AECH2121:2:1:0,AECH2241:2:1:0,AECH2251:2:1:0,AECH2331:2:1:0,AECH2122:2:2:0,AECH2142:2:2:0,AECH2332:2:2:0,CHEM2010:2:2:0,CHEM2011:2:2:0,COMM1020:2:2:0,AECH2103:2:3:0,AECH2112:2:3:0,AECH2113:2:3:0|diploma
dip-construction|engineering-and-technology|Diploma in Construction Engineering Technology|Dip. CET|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/diploma-construction|2026-2027|Elective: select 1 of 3|AECH1201:1:1:0,COMM1010:1:1:0,MATH1010:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,EFFL1003:1:1:1,AECE1200:1:2:0,AECE1230:1:2:0,AECH1100:1:2:0,AEEL1100:1:2:0,AEEL1200:1:2:0,CHEM1010:1:2:0,CHEM1011:1:2:0,MATH1020:1:2:0,AECE1340:1:3:0,AEMA1312:1:3:0,AEPC1203:1:3:0,AECE2100:2:1:0,AECE2110:2:1:0,AECE2120:2:1:0,AECE2130:2:1:0,AECE2131:2:1:0,AECE2140:2:1:0,AECE2210:2:2:0,AECE2220:2:2:0,AECE2230:2:2:0,AECE2231:2:2:0,COMM1020:2:2:0,AECH2103:2:3:0,AETN2302:2:3:0|diploma
dip-healthcare-management|business|Diploma in Healthcare Management|Dip. HCM|https://www.udst.edu.qa/academic/our-colleges/college-business/diploma-healthcare-management-dip-hcm|2026-2027|Elective - Effective & Experiential Learning: select 1 of 3|COMM1010:1:1:0,MATH1070:1:1:0,HRMG1001:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,EFFL1003:1:1:1,COMM1020:1:2:0,ACCT1001:1:2:0,MRKT1001:1:2:0,HCMT1001:1:2:0,BKFT1001:1:3:0,HCMT2001:1:3:0,BUSG2010:2:1:0,BUSG2002:2:1:0,HRMG2020:2:1:0,HCMT3001:2:1:0,HCMT3002:2:1:0,HCMT3003:2:2:0,HCMT3004:2:2:0,HCMT3005:2:2:0,HCMT3006:2:2:0,BUSG2301:2:3:0|diploma
dip-human-resource-management|business|Diploma in Human Resource Management|Dip. HRM|https://www.udst.edu.qa/academic/our-colleges/college-business/diploma-human-resource-management-dip-hrm|2026-2027|Elective - Effective & Experiential Learning: select 1 of 3|COMM1010:1:1:0,HRMG1001:1:1:0,MATH1070:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,EFFL1003:1:1:1,ACCT1001:1:2:0,COMM1020:1:2:0,COMP1401:1:2:0,MRKT1001:1:2:0,BKFT1001:1:3:0,BUSG2010:1:3:0,ECON2010:2:1:0,HRMG2020:2:1:0,HRMG3010:2:1:0,MGMT2010:2:1:0,HRMG3020:2:2:0,HRMG3030:2:2:0,HRMG3040:2:2:0,HRMG3050:2:2:0,HRMG4020:2:2:0,BUSG2301:2:3:0|diploma
dip-information-technology|computing-and-it|Diploma in Information Technology|Dip. IT|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/diploma-information-0|2026-2027|Elective - Effective & Experiential Learning: select 1 of 3|COMM1010:1:1:0,INFS1101:1:1:0,INFS1201:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,EFFL1003:1:1:1,COMM1020:1:2:0,INFT2101:1:2:0,INFT2102:1:2:0,INFT3301:1:3:0,MATH1040:1:3:0,INFS2201:2:1:0,INFT2103:2:1:0,INFT2104:2:1:0,INFT2202:2:1:0,COMP2201:2:2:0,DACS2201:2:2:0,INFT2203:2:2:0,INFT2204:2:2:0,COMP2301:2:3:0|diploma
dip-information-systems|computing-and-it|Diploma in Information Systems|Dip. IS|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/diploma-information|2026-2027||COMM1010:1:1:0,INFS1101:1:1:0,INFT1201:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,INFS1201:1:2:0,INFT2101:1:2:0,INFT2102:1:2:0,INFT2202:1:3:0,MATH1040:1:3:0,DACS2201:2:1:0,INFS2101:2:1:0,INFS2201:2:1:0,INFS3102:2:1:0,COMP2201:2:2:0,INFS3103:2:2:0,INFS3201:2:2:0,INFS3203:2:2:0,COMP2301:2:3:0|diploma
dip-marketing|business|Diploma in Marketing|Dip. Mktg|https://www.udst.edu.qa/academic/our-colleges/college-business/diploma-marketing-dip-mktg|2026-2027|Elective - Effective & Experiential Learning: select 1 of 3|MRKT1001:1:1:0,COMM1010:1:1:0,MATH1070:1:1:0,EFFL1001:1:1:1,EFFL1002:1:1:1,EFFL1003:1:1:1,COMM1020:1:2:0,MRKT2003:1:2:0,ACCT1001:1:2:0,HRMG1001:1:2:0,RSST3001:1:3:0,BKFT1001:1:3:0,ECON2010:2:1:0,BUSG2010:2:1:0,MRKT2002:2:1:0,MRKT3008:2:1:0,MRKT3104:2:1:0,MRKT3007:2:2:0,MRKT3105:2:2:0,MRKT3009:2:2:0,MRKT3011:2:2:0,BUSG2301:2:3:0|diploma
dip-pharmacy-technology|health-sciences|Diploma in Pharmacy Technology|Dip. PT|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/diploma-pharmacy-technology-dip-pt|2026-2027||BIOL1110:1:1:0,CHEM1030:1:1:0,CHEM1031:1:1:0,COMM1010:1:1:0,HSPT1101:1:1:0,BIOL1210:1:2:0,COMM1020:1:2:0,HSPT1201:1:2:0,HSPT1202:1:2:0,HSPT1203:1:2:0,BIOL1310:1:3:0,HSPT1301:1:3:0,HSHG2080:1:3:0,HSPT2101:2:1:0,HSPT2102:2:1:0,HSPT2103:2:1:0,HSPT2104:2:1:0,HSPT2201:2:2:0,HSPT2202:2:2:0,HSPT2203:2:2:0,HSPT2204:2:2:0,HSPT2300:2:3:0|diploma
dip-practical-nursing|health-sciences|Diploma in Practical Nursing|Dip. PN|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/diploma-practical-nursing-dip-pn|2026-2027||BIOL1110:1:1:0,BIOL1030:1:1:0,BIOL1031:1:1:0,COMM1010:1:1:0,NUPN1010:1:1:0,NURS1040:1:1:0,BIOL1210:1:2:0,NURS1010:1:2:0,NURS1020:1:2:0,NURS1030:1:2:0,NURS1021:1:3:0,NURS1050:1:3:0,NURS2020:2:1:0,NUPN2020:2:1:0,NUPN2030:2:1:0,NUPN2040:2:1:0,NUPN2050:2:1:0,NURS2021:2:2:0,NUPN2010:2:2:0,NURS2010:2:2:0,NURS2050:2:2:0,NUPN2060:2:3:0|diploma
msc-midwifery|health-sciences|Master of Science in Midwifery|M.Sc. Mw|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/master-science-0|2026-2027||MIDW5110:1:1:0,MIDW5120:1:1:0,MIDW5130:1:1:0,MIDW5140:1:1:0,MIDW5150:1:1:0,MIDW5210:1:2:0,MIDW5220:1:2:0,MIDW5230:1:2:0,MIDW5240:1:2:0,MIDW5250:1:2:0,MIDW6110:2:1:0,MIDW6210:2:2:0|master
msc-accounting-finance|business|Master of Science in Accounting and Finance|M.Sc. AccFin|https://www.udst.edu.qa/academic/our-colleges/college-business/master-science-accounting-and-finance-msc|2026-2027|Elective: select 1 of 3|MSAF6100:1:1:0,MSAF6105:1:1:0,MSAF6101:1:1:0,MSAF6205:1:2:0,MSAF6211:1:2:0,MSAF6201:1:2:0,MSAF6305:2:1:0,MSAF6315:2:1:1,MSAF6301:2:1:1,MSAF6325:2:1:1,MSAF6400:2:2:0|master
msc-critical-care|health-sciences|Master of Science in Critical Care Paramedicine|M.Sc. CCP|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/master-science-critical-care|2026-2027||AHHG2030:1:1:0,MACC5110:1:1:0,MACC5120:1:1:0,MACC5210:1:2:0,MACC5220:1:2:0,MACC5230:1:2:0,MACC5300:1:3:0,MACC6100:2:1:0,MACC6110:2:1:0,MACC6120:2:1:0,MACC6200:2:2:0,MACC6210:2:2:0,MACC6300:2:3:0|master
msc-data-science-ai|computing-and-it|Master of Science in Data Science and Artificial Intelligence|M.Sc. DSAI|https://www.udst.edu.qa/master-science-data-science-and-artificial-intelligence-msc-dsai|2026-2027|Elective: select 1 of 3~Elective - Research or Professional Track: select 1 of 2~Elective: select 1 of 4|DSAI5101:1:1:0,AICC5102:1:1:0,DSAI5102:1:1:0,DSAI5201:1:2:0,DSAI5202:1:2:0,AICC5204:1:2:0,DSAI6101:2:1:0,AICC6103:2:1:0,DSAI6102:2:1:1,DSAI6103:2:1:1,AICC6102:2:1:1,AICC6104:2:1:2,AICC6110:2:1:2,AICC6204:2:2:2,AICC6210:2:2:2,DSAI6201:2:2:3,DSAI6202:2:2:3,DSAI6203:2:2:3,DSAI6205:2:2:3|master
msc-diabetes-care-patient-education|health-sciences|Master of Science in Diabetes Care and Patient Education|M.Sc. DCPE|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/master-science-diabetes-care-and-patient|2026-2027||MADC5110:1:1:0,MADC5120:1:1:0,MADC5130:1:1:0,MADC5140:1:1:0,MADC5150:1:1:0,MADC5000:1:1:0,MADC5210:1:2:0,MADC5220:1:2:0,MADC5230:1:2:0,MADC5240:1:2:0,MADC5250:1:2:0,MADC5310:1:3:0,MADC6110:2:1:0,MADC6220:2:2:0,MADC6330:2:3:0|master
msc-digital-marketing-entrepreneurship|business|Master of Science in Digital Marketing and Entrepreneurship|M.Sc. DME|https://www.udst.edu.qa/master-science-digital-marketing-and-entrepreneurship-msc-dme|2026-2027||DMET5010:1:1:0,DMET5020:1:1:0,BUSG5010:1:1:0,BUSG5020:1:2:0,DMET5030:1:2:0,DMET6091:1:2:0,DMET6020:1:3:0,DMET6010:1:3:0,DMET6092:2:1:0,DMET6093:2:1:0,DMET6099:2:1:0|master
msc-human-resource-management|business|Master of Science in Human Resource Management|M.Sc. HRM|https://www.udst.edu.qa/academic/our-colleges/college-business/master-science-human-resource-management-msc|2026-2027|Elective: Select 1 of 2~Elective: select 1 of 2|HRMG5010:1:1:0,BUSG5010:1:1:0,BUSG5020:1:1:0,BUSG5030:1:2:0,HRMG5020:1:2:0,HRMG6081:1:2:1,HRMG6091:1:2:1,HRMG5030:2:1:0,HRMG5040:2:1:0,HRMG5099:2:1:0,HRMG6082:2:1:1,HRMG6092:2:1:1,HRMG6083:2:2:2,HRMG6093:2:2:2|master
msc-process-safety|engineering-and-technology|Master of Science in Process Safety|M.Sc. PS|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/master-science-process-safety|2026-2027||AECH6101:1:1:0,AECH6111:1:1:0,AECH6121:1:1:0,AECH6102:1:2:0,AECH6112:1:2:0,AECH6122:1:2:0,AECH7301:2:1:0,AECH7201:2:1:0,AECH7102:2:1:0,AECH7302:2:2:0,AECH7111:2:2:0|master
msc-stem-tvet-education|general-education|Master of Science in STEM and TVET Education|M.Sc. SET|https://www.udst.edu.qa/academic/our-colleges/college-general-education/master-science-stem-and-tvet-education|2026-2027|Elective: select 1 of 5|EDUC6310:1:1:0,EDUC6330:1:1:0,EDUC6270:1:1:0,EDUC6320:1:2:0,EDUC6340:1:2:0,EDUC6360:1:2:0,EDUC6370:1:3:0,EDUC7301:2:1:0,EDUC6355:2:1:1,EDUC6351:2:1:1,EDUC6352:2:1:1,EDUC6353:2:1:1,EDUC6354:2:1:1,EDUC7302:2:2:0|master
msc-teaching-stem|general-education|Master of Science in Teaching STEM|M.Sc. TS|https://www.udst.edu.qa/academic/our-colleges/college-general-education/master-science-teaching-stem-msc-ts|2026-2027||EDUC5203:1:1:0,EDUC5210:1:1:0,EDUC5230:1:1:0,EDUC5250:1:2:0,EDUC5220:1:2:0,EDUC5240:1:2:0,EDPR5210:1:3:0,EDPR6220:2:1:0,EDUC6270:2:2:0|master
msc-ai-cognitive-cybersecurity|computing-and-it|Master of Science in Artificial Intelligence and Cognitive Cybersecurity|M.Sc. AICC|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/master-science|2026-2027|Elective: Research or Professional Track: select 1 of 2|AICC5101:1:1:0,AICC5102:1:1:0,AICC5103:1:1:0,AICC5201:1:2:0,AICC5202:1:2:0,AICC5203:1:2:0,AICC5204:1:2:0,AICC6101:2:1:0,AICC6102:2:1:0,AICC6103:2:1:0,AICC6104:2:1:1,AICC6110:2:1:1,AICC6204:2:2:1,AICC6210:2:2:1|master
$p$, '\n') as l
where l <> '';

-- Programs
insert into public.majors (institution_id, college, college_id, slug, name, short_name, source_url, plan_year, level)
select 'udst', p.college, c.id, p.slug, p.name, p.short_name, p.source_url, p.plan_year, p.level
from _udst_programs p
join public.colleges c on c.institution_id = 'udst' and c.slug = p.college
on conflict (institution_id, slug) do update
set name = excluded.name,
    college = excluded.college,
    college_id = excluded.college_id,
    short_name = excluded.short_name,
    source_url = excluded.source_url,
    plan_year = excluded.plan_year,
    level = excluded.level;

-- Courses: add new ones; keep existing titles, fill in missing credit hours
insert into public.courses (institution_id, code, name, credits)
select 'udst', code, name, credits from _udst_courses
on conflict (institution_id, code) do update
set credits = coalesce(public.courses.credits, excluded.credits);

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

drop table _udst_courses;
drop table _udst_programs;
