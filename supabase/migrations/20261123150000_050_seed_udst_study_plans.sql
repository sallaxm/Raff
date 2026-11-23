-- 050_seed_udst_study_plans.sql
-- Official UDST bachelor study plans (2026-2027), taken from the program pages on
-- https://www.udst.edu.qa : 37 programs, 886 courses,
-- 2000 program-course links (year, term within the year, elective pools).
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
ACCT1001|Financial Accounting|3
ACCT2001|Managerial Accounting|3
ACCT2003|Intermediate Financial Accounting I|3
ACCT2005|Intermediate Financial Accounting II|3
ACCT2010|Quantitative Methods for Decision Making|3
ACCT3001|Advanced Costing & Managerial Accounting|3
ACCT3005|Accounting Information Systems|3
ACCT3007|Financial Reporting & Analysis|3
ACCT3009|Financial Modelling|3
ACCT3010|Planning, Budgeting, & Forecasting|3
ACCT4001|Auditing & Assurance Services|3
ACCT4003|Taxation|3
ACCT4005|Contemporary Topics in Accounting|3
ACCT4007|Advanced Financial Accounting|3
AEAC2101|Industrial Process Instrumentation|3
AEAC2102|Industrial Automation|2
AEAC2103|Control Strategies|2
AEAC2113|PLC Programming & Control|2
AEAC2201|Industrial Process Instrumentation (Lab)|1
AEAC2202|Industrial Automation (Lab)|1
AEAC2203|Control Strategies (Lab)|1
AEAC2213|PLC Programming & Control (Lab)|1
AEAC3000|Work Placement|9
AEAC3101|Embedded Systems|2
AEAC3102|Safety Shutdown & Instrumented Systems|2
AEAC3111|Process Control Applications|2
AEAC3112|DCS & SCADA|3
AEAC3201|Embedded Systems (Lab)|2
AEAC3202|Safety Shutdown & Instrumented Systems (Lab)|1
AEAC3211|Process Control Applications (Lab)|1
AEAC3212|DCS & SCADA (Lab)|1
AEAC4101|Robotics & Intelligent Control|3
AEAC4102|AI & Machine Learning for Process Control|2
AEAC4112|Industrial Cyber Security & IoT|2
AEAC4201|Robotics & Intelligent Control (Lab)|1
AEAC4202|AI & Machine Learning for Process Control (Lab)|1
AEAC4212|Industrial Cyber Security & IoT (Lab)|1
AECE1200|Introduction to Construction Engineering, Materials & Methods|3
AECE1230|Mechanical & Electrical Systems in Construction|3
AECE1260|Design & CAD in Construction|1
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
AECE3000|Work Placement|9
AECE3100|Soil Mechanics|3
AECE3101|Soil Mechanics (Lab)|1
AECE3120|Construction Planning & Scheduling|3
AECE3210|Construction Cost Estimation|3
AECE3230|Structural Engineering|3
AECE4100|Capstone Project I|0
AECE4110|Construction Contract Administration|3
AECE4111|Concrete Testing (Lab)|1
AECE4120|Concrete & Structural Systems Design & Behavior|3
AECE4130|Site Operations Management & Control|3
AECE4140|Digital Transformation & Technology Applications|3
AECE4200|Capstone Project II|3
AECE4210|Highway & Pavement Engineering|3
AECE4220|Facility & Infrastructure Asset Management|2
AECE4230|Construction Project Management|3
AECH1100|Environmental Awareness & Ethics|2
AECH1103|Industrial Process Overview|2
AECH1112|Health, Safety & Environment in the Process Industries|2
AECH2103|Leadership & Management Principles|2
AECH2111|Principles of Chemical Engineering I|3
AECH2112|Sustainability & Renewable Energy|3
AECH2113|Quality Assurance|2
AECH2121|Process Control Systems|3
AECH2122|Principles of Chemical Engineering II|2
AECH2131|Physical Chemistry for Chemical Engineers|3
AECH2142|Basic Fluid Mechanics & Heat Transfer|2
AECH2241|Chemical & Processing Plant Operation|2
AECH2251|Instrumentation & Control (Lab)|1
AECH2331|Process Equipment|4
AECH2332|Chemical & Processing Plant Troubleshooting|2
AECH3000|Work Placement|9
AECH3101|Fluid Mechanics|3
AECH3132|Chemical Reaction Engineering|3
AECH3222|Fluid Mechanics & Heat Transfer (Lab)|1
AECH3302|Thermodynamics|3
AECH3321|Process Unit Design|4
AECH4112|Process Safety Management|2
AECH4122|Chemical Industries & Technology|2
AECH4210|Mass Transfer & Separation Processes|3
AECH4211|Plant Design & Economics|3
AECH4221|Chemical Reaction Engineering (Lab)|1
AECH4232|Materials & Corrosion|4
AECH4301|Capstone Project I|0
AECH4302|Capstone Project II|3
AEEL1101|Fundamentals of Electricity I|3
AEEL1102|Fundamentals of Electricity II|3
AEEL1201|Fundamentals of Electricity I (Lab)|1
AEEL1202|Fundamentals of Electricity II (Lab)|1
AEEL2201|Electronic Fabrication Practices|2
AEEP2102|Power Systems I|3
AEEP2103|Facilities & Electrical Systems|2
AEEP2111|Electrical Machines|3
AEEP2113|HV Equipment Testing & Maintenance|2
AEEP2122|Motor Controls & Drives|3
AEEP2202|Power Systems I (Lab)|1
AEEP2203|Facilities & Electrical Systems (Lab)|1
AEEP2211|Electrical Machines (Lab)|1
AEEP2212|Electrical Practices (Lab)|2
AEEP2213|HV Equipment Testing & Maintenance (Lab)|1
AEEP2222|Motor Controls & Drives (Lab)|1
AEEP2301|Applied Programming|2
AEEP3102|Power Electronics|3
AEEP3111|Power Systems II|3
AEEP3112|Control Systems Design|3
AEEP3122|Renewable Energy Conversion I|3
AEEP3202|Power Electronics (Lab)|1
AEEP3211|Power Systems II (Lab)|1
AEEP3212|Control Systems Design (Lab)|1
AEEP3222|Renewable Energy Conversion I (Lab)|1
AEEP4100|Project Management|3
AEEP4111|Renewable Energy Conversion II|3
AEEP4112|Energy Efficiency & Storage|2
AEEP4122|Smart Grids|3
AEEP4211|Renewable Energy Conversion II (Lab)|1
AEEP4212|Energy Efficiency & Storage (Lab)|1
AEEP4301|Capstone Project I|0
AEEP4302|Capstone Project II|3
AEMA1000|Introduction to Engineering and Safety|2
AEMA1113|Materials Science|2
AEMA1213|Materials Science (Lab)|1
AEMA1303|Machine Shop Practices|2
AEMA1312|Engineering Graphics|3
AEMA1332|Statics|2
AEMA2103|Principles of Maintenance|2
AEMA2112|Rotating Equipment Maintenance|2
AEMA2121|Materials & Processes|2
AEMA2131|Industrial Maintenance|2
AEMA2133|Welding & Non-Destructive Testing|2
AEMA2142|Thermodynamics|2
AEMA2201|Welding Fundamentals (Lab)|1
AEMA2203|Principles of Maintenance (Lab)|1
AEMA2221|Materials & Processes (Lab)|1
AEMA2222|Non-Destructive Testing (Lab)|1
AEMA2231|Industrial Maintenance Mechanics (Lab)|1
AEMA2232|Rotating Equipment Maintenance (Lab)|1
AEMA2233|Welding & Non-Destructive Testing (Lab)|1
AEMA2242|Thermodynamics (Lab)|1
AEMA2311|Computer Aided Design I|3
AEMA2333|Introduction to Dynamics|2
AEMA2341|3D Computer Aided Design|3
AEMA2343|Manufacturing Processes|3
AEMA2348|Data Science & AI|3
AEMA3000|Work Placement|9
AEMA3121|Fluid Mechanics|2
AEMA3133|Quality Management|2
AEMA3142|Applied Heat Transfer|3
AEMA3200|Manufacturing Technologies (Lab)|1
AEMA3221|Fluid Mechanics (Lab)|1
AEMA3232|Advanced Manufacturing|3
AEMA3301|Mechanics, Statics & Dynamics|3
AEMA3302|Strength of Materials|3
AEMA3331|Dynamics & Control|2
AEMA3341|Advanced Materials Engineering|2
AEMA3342|Machine Design I|2
AEMA3347|Designing & Rapid Prototyping|2
AEMA3348|Manufacturing Analytics|3
AEMA3351|Robotics|3
AEMA3355|Manufacturing Automation|3
AEMA4100|Project Management & Leadership|3
AEMA4112|Machine Design II|2
AEMA4132|Reliability Centered Maintenance|2
AEMA4142|Heat Transfer|3
AEMA4151|Logistics and Supply Chain Management|3
AEMA4232|Reliability Centered Maintenance (Lab)|1
AEMA4301|Capstone Project I|0
AEMA4302|Capstone Project II|3
AEMA4312|CNC & CAM|3
AEMA4341|Automotive Engineering|3
AEMA4342|Computer-Integrated Manufacturing (CIM)|3
AEMA4343|Advanced Mechanical Vibration|3
AEMA4344|HSE Engineering|3
AEMA4345|Piping & Pipeline Engineering|3
AEMA4351|Digital Manufacturing|3
AEMR1000|Introduction to Marine Engineering|1
AEMR1102|Health & Safety in Marine Engineering|2
AEMR3000|Work Placement/Sea Time|9
AEMR3105|Maritime Laws & Standards|1
AEMR3111|Ship Propulsion|3
AEMR3112|Ship Propulsion (Lab)|1
AEMR3302|Strength of Materials & Ship Hull|3
AEMR3303|Machine Elements|3
AEMR4101|Marine Engines|3
AEMR4103|Marine Engines (Lab)|1
AEMR4104|Marine Control Systems|3
AEMR4106|Marine Hydrodynamics|3
AEMR4108|Ship System Operation & Navigation Simulation|2
AEMR4110|Maritime Green Operations & Decarbonization Technology|1
AEMR4112|Introduction to Maritime Economics & Logistics|3
AEMR4114|Safety Management|3
AEMR4301|Capstone Project I|0
AEMR4302|Capstone Project II|3
AEMR4311|Ship Systems & Equipment Design|3
AEPC1203|Basic Instrumentation|2
AERO1000|Introduction to Aviation and Airworthiness|3
AERO1332|Statics|2
AERO2103|Principles of Aircraft Maintenance|2
AERO2122|Aircraft Non-Destructive Testing|1
AERO2123|Aviation Law & Legislation|2
AERO2203|Principles of Aircraft Maintenance (Lab)|1
AERO2222|Aircraft Non-Destructive Testing (Lab)|1
AERO2311|Aircraft Systems I|3
AERO2321|Aircraft Electronics & Digital Systems|3
AERO2322|Aerospace Materials|3
AERO2333|Avionics|3
AERO3000|Work Placement in Aviation|9
AERO3101|Aero-Propulsion|2
AERO3121|Aerodynamics|2
AERO3133|Advanced Aero-Propulsion|3
AERO3201|Aero-Propulsion (Lab)|1
AERO3221|Aerodynamics (Lab)|1
AERO3305|Aircraft Systems II|3
AERO3311|Aero-Structures|3
AERO3322|Flight Mechanics|2
AERO3344|Advanced Fluid Mechanics|3
AERO4100|Project Management & Leadership|3
AERO4131|Human Factors in Aviation|2
AERO4132|Stability & Control|3
AERO4200|Unmanned Aerial Vehicles (UAV)|2
AERO4211|Aircraft Maintenance Engineering|2
AERO4301|Capstone Project I|0
AERO4302|Capstone Project II|3
AETN1102|Network Fundamentals|3
AETN1112|Digital Electronics|3
AETN1202|Network Fundamentals (Lab)|1
AETN1212|Digital Electronics (Lab)|1
AETN2101|Analog Electronics|3
AETN2111|Network Switching & Routing|3
AETN2112|Enterprise Networks|3
AETN2121|Analog & Digital Communication|3
AETN2122|Wireless Communication Systems|3
AETN2201|Analog Electronics (Lab)|1
AETN2211|Network Switching & Routing (Lab)|1
AETN2212|Enterprise Networks (Lab)|1
AETN2221|Analog & Digital Communication (Lab)|1
AETN2222|Wireless Communication Systems (Lab)|1
AETN2302|Applied Programming I|2
AETN3101|Cyber Security|3
AETN3102|Antennas & Wave Propagation|2
AETN3111|Applied Electromagnetics|3
AETN3112|Network Management|2
AETN3122|Telecommunications Networks|3
AETN3201|Cyber Security (Lab)|1
AETN3202|Antennas & Wave Propagation (Lab)|1
AETN3203|Work Placement|9
AETN3221|Linux Operating System|2
AETN3222|Artificial Intelligence & Data Science|2
AETN4101|Continuous & Discrete-time Signals & Systems|3
AETN4112|Enterprise Unified Communications|3
AETN4121|Microwave Engineering|2
AETN4212|Enterprise Unified Communications (Lab)|1
AETN4221|Microwave Engineering (Lab)|1
AETN4301|Capstone Project I|0
AETN4302|Capstone Project II|3
AVMG1001|Introduction to Aviation Industry|3
AVMG2001|Introduction to Aviation Meteorology|3
AVMG2002|Introduction to Aviation Cybersecurity|3
AVMG3001|Aviation Safety & Security|3
AVMG3002|Airport Planning & Operations|3
AVMG3003|Aviation Data Analytics|3
AVMG3004|Aviation Law & Regulations|3
AVMG3005|Airline Operations|3
AVMG3006|Air Cargo Management|3
AVMG3007|Airline Revenue Management|3
AVMG3008|Aviation Logistics Management|3
AVMG3009|Air Traffic Control Management|3
AVMG4001|Airport Facilities Management|3
AVMG4002|Aircraft Maintenance Management|3
AVMG4003|Aviation Risk Management|3
AVMG4004|Sustainable Practices in Aviation|3
AVMG4301|Capstone Project I|0
AVMG4302|Capstone Project II|3
AVMG4303|Work Placement|9
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
BIOL3130|Veterinary Immunology|3
BIOL4140|Veterinary Genetics|3
BKFT1001|Principles of Finance|3
BKFT2001|Banking & Financial Institutions|3
BKFT3001|Financial Risk Management|3
BKFT3005|Strategic Financial Decision Making|3
BKFT3007|Principles of Corporate Finance|3
BKFT3010|Personal Finance & Wealth Planning|3
BKFT4001|Financial Innovation in Markets & Technologies|3
BKFT4010|Portfolio Management|3
BKFT4015|Derivatives & Risk|3
BKFT4020|Investment Analysis|3
BUSG2001|Introduction to Entrepreneurship|3
BUSG2002|Project Management|3
BUSG2010|Qatar Business Law|3
BUSG4101|Capstone Project I|3
BUSG4201|Capstone Project II|3
BUSG4301|Work Placement|9
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
COMM3010A|Research & Reporting (البحوث وإعداد التقارير)|3
COMP1401|Introduction to Computers & Information Systems|3
COMP3301|Work Placement I|3
COMP4101|Practicum|3
COMP4201|Capstone Project|3
COMP4301|Work Placement|9
COMP4302|Work Placement II|6
CUBM1001|Principles of Border Management|3
CUBM2001|Customs Regulations|3
CUBM2010|International Trade Terms & Treaties|3
DACS2101|Discrete Structures|3
DACS2201|Introduction to Data & Cyber Security|3
DACS2202|Introduction to Computing Systems|4
DACS3101|Applied Cryptography|3
DACS3201|Network Security|3
DACS3202|Cyber Security Analytics & Visualization|3
DACS3203|Secure Software Development|3
DACS3301|Privacy in the Digital Era|3
DACS4101|Security Engineering Principles|3
DACS4102|Web Security|3
DACS4103|Scripting for Cyber Security|3
DACS4105|Fundamentals of Cyber-Physical Systems|3
DACS4110|Selected Topics in Data and Cyber Security|3
DACS4202|Penetration Testing|3
DACS4203|IoT & OT Hacking|3
DACS4204|Cloud Security|3
DACS4205|Digital Forensics|3
DACS4206|Security Monitoring & Incident Response|3
DACS4208|Industrial Control Systems Security|3
DACS4210|Cyber Security Policies, Strategies & Procedures|3
DCMP1001|Media Theory & Practice|3
DCMP1001A|Media Theory & Practice (نظريات الإعلام والممارسات )|3
DCMP1003|Qatar Media History|3
DCMP1003A|Qatar Media History ( تاريخ الإعلام القطري )|3
DCMP2001|Digital Communication Strategies|3
DCMP2001A|Digital Communication Strategies ( استراتيجيات الاتصال الرقمي )|3
DCMP2005|Digital Media Communication|3
DCMP2005A|Digital Media Communication ( وسائل الإعلام الرقمية والاتصالات )|3
DCMP2010|Introduction to Journalism|3
DCMP2010A|Introduction to Journalism (مقدمه في الصحافه)|3
DCMP2015|Introduction to Visual Communications|3
DCMP2025|Graphic Design Fundamentals|3
DCMP2030|Newswriting Techniques|3
DCMP2030A|Newswriting Techniques ( تقنيات كتابة الأخبار )|3
DCMP2035|Studio Production I|3
DCMP2035A|Studio Production I ( ستوديو الإنتاج 1 )|3
DCMP2040|Future Digital Journalism & Media|3
DCMP2040A|Future Digital Journalism & Media ( مستقبل الصحافة الرقمية والإعلام )|3
DCMP2045|Studio Production II|3
DCMP2045A|Studio Production II ( ستوديو الإنتاج 2 )|3
DCMP2050|Strategic Storytelling|3
DCMP2050A|Strategic Storytelling (استراجية رواية القصص)|3
DCMP2060|Qatar Media Law|3
DCMP2060A|Qatar Media Law ( قانون الإعلام القطري )|3
DCMP3005|Documentary Production|3
DCMP3005A|Documentary Production ( إنتاج الأفلام الوثائقية )|3
DCMP3010|Project Management in Media|3
DCMP3020|Data Journalism|3
DCMP3021|TV & Film Production Technologies|3
DCMP3021A|TV & Film Production Technologies ( تقنيات إنتاج التلفزيون والسينما )|3
DCMP3032|Human Computer Interaction in Media|3
DCMP3050|Immersive Technology & Concept Art|3
DCMP3050A|Immersive Technology & Concept Art ( التكنولوجيا المتطورة والفن التصويري )|3
DCMP4006|Sound Design & Audio Production|3
DCMP4015|Video & Film Production|3
DCMP4015A|Video & Film Production ( إنتاج الفيديو والأفلام )|3
DCMP4025|Digital & Alternative Media Production|3
DCMP4040|Transmedia Production|3
DCMP4045|3D Modelling & Virtual Reality|3
DSAI2201|Introduction to Data Science & AI|3
DSAI3201|Machine Learning|3
DSAI3202|Cloud Computing for Data Science|3
DSAI3203|Fundamentals of AI|3
DSAI3205|Web Mining|3
DSAI3301|Data Analysis & Visualization|3
DSAI3302|Ethical AI & Data Governance|3
DSAI4101|Deep Learning|3
DSAI4103|Business Analytics|3
DSAI4104|Fundamentals of IoT|3
DSAI4107|Reinforcement Learning|3
DSAI4108|Signal & Image Processing|3
DSAI4109|Natural Language Processing|3
DSAI4201|Selected Topics in Data Science|3
DSAI4202|Information Retrieval|3
DSAI4207|Natural Language Processing with Deep Learning|3
DSAI4208|Computer Vision|3
DSAI4209|Data-Intensive Computing|3
EASC1001|Soil Science|3
ECON1001|Global Economic Concepts|3
ECON2010|Business Economics|3
EDPR2010|School/Industry Experience|3
EDPR3010|School/Industry Experience II|3
EDPR4010|Teaching Practicum|9
EDUC1010|Education in Qatar from an International Perspective|3
EDUC1080|Teaching STEM in Arabic and International School Settings|3
EDUC2010|Learning Theories in Mathematics/Science Education|3
EDUC2020|Learning Theories in Engineering/Technology Education|3
EDUC2030|Methods in STEM Education I|3
EDUC3020|Learning Environment Management|3
EDUC3030|Methods in STEM Education II|3
EDUC3040|Technology in STEM Education|3
EDUC3050|Assessment in STEM Education I|3
EDUC3060|Assessment in STEM Education II|3
EFFL1003|Experiential Learning & Entrepreneurship|3
GARC1001|Qatar History & Society|3
GARC2001|Human Development in Qatar|3
GARC2002|Globalization & Environment|3
GARC2003|Data Governance, AI & Society|3
GARC2004|International Migration & Social Change|3
HCMT1001|Introduction to Healthcare Management|3
HCMT2001|Healthcare Operations Management|3
HCMT3001|Health Policy|3
HCMT3002|Healthcare Information Governance|3
HCMT3003|Healthcare Quality Management|3
HCMT3004|Health Economics|3
HCMT3005|Healthcare Informatics|3
HCMT3006|Healthcare Risk Management|3
HCMT3007|Research in Healthcare Management|3
HCMT4008|Trends in Healthcare|3
HCMT4009|Career Planning in Healthcare Management|3
HRMG1001|Principles of Human Resource Management|3
HRMG2020|Employee Relations|3
HRMG3010|Recruitment & Selection|3
HRMG3020|Qatar Employment Law|3
HRMG3030|Occupational Health & Safety|3
HRMG3040|Performance Management|3
HRMG3050|Learning & Development|3
HRMG3060|Compensation & Benefits|3
HRMG4010|International Human Resource Management|3
HRMG4030|Organizational Design & Development|3
HRMG4040|Artificial Intelligence in Human Resource Management|3
HRMG4081|Psychology in Human Resource Management|3
HRMG4083|Workforce Planning|3
HRMG4084|Managing Globally Inclusive Workplace|3
HRMG4091|Creativity & Innovation in the Workplace|3
HRMG4092|Human Resource Analytics|3
HRMG4093|Strategic Human Resource Management|3
HRMG4094|Quality Practices in Human Resource Management|3
HSDH1270|Principles & Issues in Dental Hygiene|3
HSDH2120|Head & Neck Anatomy|3
HSDH2130|Dental Anatomy|3
HSDH2140|Oral Histology & Embryology|2
HSDH2210|General Dentistry Introduction|3
HSDH2240|Periodontology I|3
HSDH2250|Introduction to Dental Hygiene|4
HSDH2260|Dental Hygiene Instrumentation|3
HSDH2280|Radiology I|2
HSDH2350|Fundamentals of Clinical Dental Hygiene|4
HSDH2390|Community Oral Health I|2
HSDH3100|Oral Pathology|3
HSDH3150|Dental Hygiene Theory I|4
HSDH3160|Dental Hygiene Practice I|3
HSDH3181|Radiology II|3
HSDH3200|Pharmacology & Pain Management|3
HSDH3241|Periodontology II|3
HSDH3250|Dental Hygiene Theory II|4
HSDH3260|Dental Hygiene Practice II|3
HSDH3350|Dental Hygiene Theory III|2
HSDH3360|Dental Hygiene Practice III|2
HSDH3371|Dental Hygiene Practice Management|3
HSDH4150|Dental Hygiene Theory IV|2
HSDH4160|Dental Hygiene Practice IV|3
HSDH4190|Community Oral Health II|2
HSDH4250|Dental Hygiene Theory V|2
HSDH4260|Dental Hygiene Practice V|2
HSDH4290|Community Oral Health III|2
HSDH4340|Periodontology III|3
HSEH1110|Principles of Environmental Health|4
HSEH1310|Environmental Health Law|3
HSEH2120|Drinking Water Quality|4
HSEH2130|Indoor Air Quality|4
HSEH2210|Communicable Diseases|4
HSEH2320|Professionalism & Ethics for Environmental Health|3
HSEH3120|Food Safety|4
HSEH3141|Solid Waste Management|3
HSEH3210|Ambient Air Quality|4
HSEH3220|Communicable Disease, Investigation, & Control|4
HSEH3230|Health Promotion & Education|3
HSEH3240|Recreational Water Quality|4
HSEH3250|Wastewater Management|3
HSEH3310|Environmental Health Practicum I|4
HSEH4110|Environmental Health Applications|4
HSEH4120|Housing & Health|4
HSEH4130|Land Use & Community Planning|4
HSEH4210|Emergency Management|3
HSEH4230|Food Integrity|4
HSEH4310|Environmental Health Practicum II|4
HSHG2020|Health & Wellness|3
HSHG2080|Ethics in Healthcare|3
HSHG2090|Principles of Pharmacology|3
HSHG2101|Health Technology & Informatics|3
HSHG2210|Communications in Healthcare|3
HSHG4101|Leadership & Change Management for Health Professionals|3
HSMI1110|Introduction to Medical Imaging Practice|2
HSMI1120|Medical Imaging Physics|3
HSMI1210|Medical Imaging Instrumentation|3
HSMI1220|Radiobiology & Radiation Protection|3
HSMI1310|Quality Management in Medical Imaging|3
HSMI2110|Digital Imaging|3
HSMI2120|Patient Care in Medical Imaging|3
HSMI2130|Radiographic Procedures & Related Anatomy I|6
HSMI2210|Clinical Imaging Workterm Orientation|2
HSMI2220|Computed Tomography I|3
HSMI2230|Magnetic Resonance Imaging I|3
HSMI2240|Principles of Radiologic Diagnosis I|2
HSMI2250|Radiographic Procedures & Related Anatomy II|6
HSMI2310|Clinical Imaging Workterm I|2
HSMI2320|Cross-sectional Anatomy I|3
HSMI2330|Radiographic Procedures & Related Anatomy III|2
HSMI3120|Computed Tomography II|3
HSMI3130|Cross-sectional Anatomy II|3
HSMI3140|Magnetic Resonance Imaging II|3
HSMI3150|Ultrasound I|3
HSMI3210|Clinical Imaging Workterm III|4
HSMI3220|Imaging Biomarkers & Quantitative Analysis|3
HSMI3230|Principles of Radiologic Diagnosis II|3
HSMI3240|Ultrasound II|3
HSMI3310|Clinical Imaging Workterm IV|3
HSMI3320|Essentials of Nuclear Medicine|3
HSMI4110|Emerging Trends & Challenges in Medical Imaging Practice|4
HSMI4120|Advanced Clinical Imaging Workterm I|8
HSMI4210|Advanced Clinical Imaging Workterm II|10
HSOH1100|Introduction to Health, Safety, & Environment|4
HSOH1200|Health, Safety, & Environment Management Systems|4
HSOH1300|Health, Safety, & Environment Law|3
HSOH2040|Professionalism & Ethics|3
HSOH2050|Epidemiology|3
HSOH2102|Introduction to Toxicology|4
HSOH2110|Occupational Hazards & Controls|4
HSOH2220|Inspections & Investigations|4
HSOH2300|Process Safety Management|3
HSOH3110|Fire Safety & Risk Management|4
HSOH3120|Management of Health & Wellness at Work|4
HSOH3150|Occupational Hygiene I|4
HSOH3210|Ergonomics|4
HSOH3220|Environmental Management|4
HSOH3251|Occupational Hygiene II|4
HSOH3300|Health & Safety Auditing|3
HSOH4100|International Oil & Gas Certificate|4
HSOH4130|Occupational Health & Safety in the Construction Industry|6
HSOH4200|Occupational Health, Safety, & Environment Degree Practicum|8
HSPA1000|Fundamentals of Paramedic Practice|3
HSPA2100|Cardiology|4
HSPA2101|Emergency Medical Care I|3
HSPA2111|Clinical Practice in Paramedicine I|4
HSPA2150|Occupational Fitness|2
HSPA2202|Emergency Medical Care II|3
HSPA2212|Clinical Practice in Paramedicine II|2
HSPA2241|Traumatology I|4
HSPA2303|Emergency Medical Care III|4
HSPA2313|Clinical Practice in Paramedicine III|2
HSPA2360|Mental Health for Paramedics|3
HSPA2375|Special Patient Populations|3
HSPA3165|Pediatrics, Obstetrics & Neonatology|3
HSPA3221|Paramedic Patient Management I|3
HSPA3231|Paramedic Integration I|3
HSPA3242|Traumatology II|4
HSPA3280|Disaster Management|3
HSPA3341|Ambulance Practicum|8
HSPA3370|Paramedicine in Primary Healthcare|3
HSPA4122|Paramedic Patient Management II|3
HSPA4132|Paramedic Integration II|2
HSPA4223|Paramedic Patient Management III|5
HSPA4233|Paramedic Integration III|4
HSPA4285|Management Practice in EMS|3
HSPA4342|Critical Care Practicum|8
HSPT1101|Pharmaceutical Calculations I|3
HSPT1201|Pharmacy Computer Systems|3
HSPT1202|Pharmaceutical Calculations II|3
HSPT1203|Pharmacy Management & Inventory Control|3
HSPT1301|Pharmacy Regulations & Professionalism|3
HSPT2100|Organic Chemistry for Healthcare|4
HSPT2101|Prescription Processing|4
HSPT2102|Pharmacology I|5
HSPT2103|Community Pharmacy Practice|4
HSPT2104|Medication Safety, Quality & Drug Reconciliation|3
HSPT2201|Hospital Pharmacy Practice|3
HSPT2202|Aseptic Technique|4
HSPT2203|Pharmacology II|5
HSPT2204|Nonsterile Compounding|3
HSPT2300|Clinical Work Term|6
HSPT3101|Pharmacy Informatics|3
HSPT3201|Pharmaceutical Process Technology|3
HSPT3202|Pharmacognosy|3
HSPT3203|Pharmaceutical Analysis|4
HSPT3204|Biochemistry for Healthcare|3
HSPT4101|Biopharmaceutics & Pharmacokinetics|3
HSPT4102|Drug Discovery & Development|3
HSPT4103|Vaccine Development|3
HSPT4104|Good Manufacturing Practice|3
HSPT4105|Regulatory Affairs & Pharmaceutical Jurisprudence|3
HSPT4200|Pharmacy Technology Work Term|8
HSRT1000|Professional Practice in Respiratory Therapy|3
HSRT1100|Medical Gas Therapy|4
HSRT2120|Cardiopulmonary Physiology|4
HSRT2200|Cardiopulmonary Pathophysiology I|4
HSRT2210|Pharmacology for Respiratory Therapy|3
HSRT2220|Respiratory Techniques|4
HSRT2300|Airway Management|4
HSRT2310|Respiratory Therapy Workterm Application I|1
HSRT2320|Cardiopulmonary Pathophysiology II|3
HSRT2330|Mechanical Ventilation I|4
HSRT2340|Respiratory Therapy Workterm Application II|1
HSRT3000|Emerging Trends in Respiratory Therapy|3
HSRT3120|Cardiac Diagnostics|3
HSRT3130|Neonatal Respiratory Care|4
HSRT3140|Anesthesia|3
HSRT3200|Mechanical Ventilation II|4
HSRT3210|Pulmonary Diagnostics|4
HSRT3230|Cardiopulmonary Resuscitation|2
HSRT3240|Respiratory Therapy Workterm Application III|1
HSRT3300|Mechanical Ventilation III|3
HSRT3310|Respiratory Therapy Workterm Application IV|2
HSRT3330|Respiratory Therapy Workterm Practicum I|4
HSRT4200|Respiratory Therapy Workterm Practicum II|9
HSRT4300|Respiratory Therapy Workterm Practicum III|9
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
HSVS3110|Practice Management|3
HSVS3120|Fundamentals of Toxicology|3
HSVS3210|Food Safety & Integrity|4
HSVS3250|Work Term IV|4
HSVS3310|Critical Thinking & Application|2
HSVS4110|Biosecurity & Compliance in Animal Services|3
HSVS4120|Advanced Animal Feed & Nutrition|3
HSVS4250|Consolidation Work Term|8
INFS1101|Introduction to Computing & Problem Solving|3
INFS1201|Computer Programming|4
INFS1202|Fundamentals of Information Systems|3
INFS1301|Computing Ethics & Society|3
INFS2101|Web Technologies I|3
INFS2201|Database Management Systems|3
INFS3102|Object Oriented Programming|3
INFS3103|Systems Analysis & Design|3
INFS3104|Data Structures & Algorithms|3
INFS3201|Web Technologies II|3
INFS3202|IT Systems Integration|3
INFS3203|Systems Deployment & Implementation|3
INFS3301|Human Computer Interaction|3
INFS4101|IS Management & Strategy|3
INFS4102|Desktop Application Development|3
INFS4104|Mobile App Technologies|3
INFS4105|Advanced Database Management|3
INFS4106|Information Systems Seminar|1
INFS4202|Software Testing & Quality Assurance|3
INFS4205|Selected Topics in Information Systems|3
INFS4206|Native App Technologies|3
INFT1201|Computer Hardware|4
INFT2101|Networking I|4
INFT2102|Mathematics for IT|3
INFT2201|Introduction to Operating Systems|3
INFT2202|Linux Foundations|3
INFT3100|OOP and Web Applications|3
INFT3101|Networking II|3
INFT3102|Network Programming|3
INFT3200|Mobile Applications Design|3
INFT3201|System Integration & Administration|3
INFT3202|Cloud Computing|3
INFT3203|Web Server Management|3
INFT3301|IT Service Management|3
INFT4103|Software Defined Networking|3
INFT4104|Selected Topics in IT|3
INFT4105|Wireless Networks|3
INFT4106|Computer Network Protocols|3
INFT4107|Virtualization Technologies|3
INFT4108|Cloud Automation & Orchestration|3
INFT4201|Enterprise Technology|3
INFT4203|Network Management|3
INFT4208|Governance & Management of IT|3
LSCM1001|Principles of Logistics & Supply Chain|3
LSCM3010|Supply Chain Planning & Control|3
LSCM3020|Transport & Logistics Management|3
LSCM3030|Strategic Sourcing & Procurement|3
LSCM3040|Legal Environment & Supply Chain Contracts|3
LSCM3050|Warehousing & Inventory Management|3
LSCM4010|Supply Chain Modelling & Analytics|3
LSCM4021|Technology for Supply Chain & Border Management|3
LSCM4030|Data Driven Decision Making|3
LSCM4081|Maritime & Ports Management|3
LSCM4082|Marine Economics & International Trade|3
LSCM4083|Marine Insurance|3
LSCM4084|Shipbroking & Chartered Vessel Operations|3
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
MGMT3035|Business Ethics|3
MGMT4000|Strategic & Sustainable Management|3
MGMT4010|Leadership & Change Management|3
MIDW1010|Introduction to the Midwifery Profession|3
MIDW1210|Reproductive Anatomy & Physiology|4
MIDW1220|Midwifery Therapeutics I|4
MIDW1230|Maternal Nutrition & Infant Feeding|3
MIDW1310|Well Women & Newborn Health Assessment|4
MIDW1320|Introduction to Midwifery Practice|3
MIDW2030|Midwifery Therapeutics II|4
MIDW2040|Theoretical Perspectives of Family Health|2
MIDW2041|Theoretical Perspectives of Women’s Health|2
MIDW2042|Theoretical Perspectives of Newborn Health|2
MIDW2210|Theoretical Perspectives of Complex Maternal Health|3
MIDW2211|Theoretical Perspectives of Complex Newborn Health|3
MIDW2220|Midwifery Care for Complex Maternal Health|4
MIDW2221|Midwifery Care for Complex Newborn Health|4
MIDW2240|Midwifery Practice I|4
MIDW2340|Midwifery Practice II|4
MIDW3010|Organization of Midwifery Practice|3
MIDW3020|Adaptive Leadership & Clinical Management|3
MIDW3040|Midwifery Practice III|4
MIDW3210|Critical Analyses of Global Health Trends for Midwives|3
MIDW3240|Midwifery Practice IV|5
MIDW3340|Exploratory Practice for Midwives|5
MIDW4040|Midwifery Practice V|9
MIDW4240|Consolidation of Midwifery Practice|9
MISY2010|Management Information Systems|3
MRKT1001|Principles of Marketing|3
MRKT2002|Marketing Research|3
MRKT2003|Fundamentals of Digital Marketing|3
MRKT3006|Services Marketing|3
MRKT3007|Professional Selling|3
MRKT3008|Digital Marketing Communications|3
MRKT3009|Marketing Analytics & Data Mining|3
MRKT3010|Digital Optimization|3
MRKT3011|Branding in the Digital Age|3
MRKT3104|Consumer Behavior in the Digital Age|3
MRKT3105|Marketing Content & Media Management|3
MRKT3105A|Marketing Content & Media Management ( تسويق المحتوى وإدارة وسائل الإعلام )|3
MRKT4112|Advanced Topics in Digital Marketing|3
MRKT4213|Sales Management|3
MRKT4214|Digital Marketing Strategy|3
NUMW1230|Maternal Nutrition & Infant Feeding|3
NUMW2020|PD Women & Newborn Health Assessment|4
NUMW2030|Midwifery Therapeutics II|4
NUMW3020|Adaptive Leadership & Clinical Management|3
NUMW3110|Context of Midwifery Practice|3
NUMW3120|PD Reproductive Anatomy & Physiology|2
NUMW3130|PD Communication for Midwives|2
NUMW3150|PD Introduction to Midwifery Practice|2
NUMW3210|Critical Analyses of Global Health Trends for Midwives|3
NUMW3220|PD Complex Maternal Care|4
NUMW3230|PD Complex Neonatal Care|4
NUMW3250|PD Midwifery Practice I|2
NUMW3350|PD Midwifery Practice II|3
NUMW4150|PD Midwifery Practice III|10
NUMW4250|PD Consolidation of Midwifery Practice|10
NUMW4350|PD Exploratory Practice for Midwives|5
NURS1010|Introduction to Pathophysiology & Pharmacotherapeutics|4
NURS1020|Nursing Therapeutics I|4
NURS1021|Nursing Therapeutics II|4
NURS1030|Introduction to Health Assessment|4
NURS1040|Health & Health Systems|4
NURS1050|Person & Family Centered Practice|3
NURS1101|Introduction to the Nursing Profession|3
NURS2010|Theoretical Perspectives of Acute Health|6
NURS2020|Alterations & Therapeutics I|4
NURS2021|Alterations & Therapeutics II|4
NURS2101|Perspectives of Family Health|3
NURS2102|Perspectives of Maternal & Newborn Health|2
NURS2103|Perspectives of Pediatric & Adolescent Health|2
NURS2104|Perspectives of Family & Community Health|4
NURS2401|Nursing Practice for Families|3
NURS2491|Nursing Practice for Acute Health I|3
NURS2492|Nursing Practice for Acute Health II|2
NURS3101|Perspectives of Complex Health|6
NURS3102|Perspectives of Chronic Health & Life Limiting Conditions|3
NURS3103|Transition to Professional Practice|3
NURS3104|Knowledge & Innovation in Nursing|3
NURS3391|Advanced Health Assessment & Therapeutics I|4
NURS3392|Advanced Health Assessment & Therapeutics II|4
NURS3401|Integrated Nursing Practice I|3
NURS3402|Integrated Nursing Practice II|5
NURS3403|Integrated Nursing Practice III|2
NURS3404|PD Exploratory Nursing Practice I|2
NURS3405|Post LPN Integrated Practice I|3
NURS3406|Post LPN Integrated Practice II|3
NURS3407|Post LPN Integrated Practice III|2
NURS4101|Best Practices & Quality Improvement|3
NURS4102|Organization of the Nursing Profession|3
NURS4103|Critical Analyses of Global Health Trends for Nurses|3
NURS4104|Adaptive Leadership & Clinical Management|3
NURS4105|Clinical Management & Business Basics for Nurses|3
NURS4106|Adaptive Leadership for Nurses|3
NURS4401|Exploratory Practice for Nurses|5
NURS4402|Consolidation of Nursing Practice|8
NURS4403|PD Exploratory Nursing Practice II|2
NURS4404|PD Exploratory Nursing Practice III|4
NURS4405|PD Exploratory Nursing Practice IV|4
NURS4407|Post LPN Integrated Practice IV|3
NURS4408|Post LPN Consolidation of Practice|5
NURS4409|Post LPN Exploratory Practice|5
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
RSST1001|Qualitative Designs & Analyses|3
RSST3001|Research & Statistics|3
RSST3002|Probability & Statistical Analysis|3
SCIE1001|Science & Its Applications|3
SCIE1002|Science & the Environment|3
SOFT2101|Software Engineering Principles|3
SOFT2301|Software Project Management|3
SOFT3201|Software Architecture & Design|3
SOFT3202|Design Patterns & Modeling|3
SOFT4101|Game Engineering|3
SOFT4102|Design Thinking for Software Entrepreneurship|3
SOFT4103|UI/UX Design|3
SSHA1001|Islamic & Arab Civilization|3
SSHA1002|Introduction to Sociology|3
SSHA1003|Introductory Psychology|3
SSHA1004|Ethical Reasoning|3
SSHA1005|Law & Society|3
SSHA1006|Introduction to the Arts|3
SSHA1007|Introduction to Arab Culture & Communication|3
SSHA2001|Visual Literacy|3
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
       split_part(l, '|', 8) as links
from regexp_split_to_table($p$
bba-applied-accounting|business|Bachelor of Business Administration in Applied Accounting|B.B.A. AAcc|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-applied|2026-2027|General Education Requirement: select 1 of 57~General Education Requirement: select 1 of 2~General Education Requirement: select 1 of 6~Elective: select 1 of 2|ACCT1001:1:1:0,COMM1010:1:1:0,MATH1070:1:1:0,EFFL1003:1:1:0,BKFT1001:1:2:0,COMM1020:1:2:0,MRKT1001:1:2:0,BIOL1001:1:2:1,BIOL1002:1:2:1,BIOL1003:1:2:1,BIOL1030:1:2:1,BIOL1031:1:2:1,BIOL1070:1:2:1,BIOL1110:1:2:1,BIOL1111:1:2:1,BIOL1210:1:2:1,BIOL1211:1:2:1,BIOL1310:1:2:1,BIOL2010:1:2:1,BIOL2011:1:2:1,CHEM1010:1:2:1,CHEM1011:1:2:1,CHEM1020:1:2:1,CHEM1021:1:2:1,CHEM1030:1:2:1,CHEM1031:1:2:1,CHEM1040:1:2:1,CHEM1041:1:2:1,CHEM1050:1:2:1,CHEM1051:1:2:1,CHEM2010:1:2:1,CHEM2011:1:2:1,CHEM3010:1:2:1,CHEM3011:1:2:1,CHEM3050:1:2:1,COMP1401:1:2:1,INFT2102:1:2:1,EASC1001:1:2:1,MATH1010:1:2:1,MATH1020:1:2:1,MATH1030:1:2:1,MATH1040:1:2:1,MATH1050:1:2:1,MATH1060:2:1:0,MATH2002:1:2:1,MATH2010:1:2:1,MATH2020:1:2:1,MATH3010:1:2:1,MATH3020:1:2:1,MATH3030:1:2:1,PHYS1000:1:2:1,PHYS1001:1:2:1,PHYS1020:1:2:1,PHYS1021:1:2:1,PHYS1030:1:2:1,PHYS1031:1:2:1,PHYS1040:1:2:1,PHYS1041:1:2:1,PHYS1050:1:2:1,PHYS1130:1:2:1,PHYS2001:1:2:1,SCIE1001:1:2:1,SCIE1002:1:2:1,HRMG1001:1:3:0,BUSG2001:1:3:2,SSHA1004:1:3:2,ACCT2003:2:1:0,ACCT2010:2:1:0,ECON2010:2:1:0,ACCT2001:2:2:0,ACCT2005:2:2:0,BKFT3007:2:2:0,BUSG2010:2:2:0,MISY2010:2:2:0,MGMT2010:2:3:0,ECON1001:2:3:3,GARC1001:2:3:3,GARC2001:2:3:3,GARC2002:2:3:3,GARC2003:2:3:3,GARC2004:2:3:3,ACCT3001:3:1:0,ACCT3005:3:1:0,MGMT3035:3:1:0,ACCT3007:3:2:0,ACCT3009:3:2:0,BKFT3001:3:2:0,BKFT3005:3:2:0,RSST3001:3:2:0,MGMT4000:3:3:0,ACCT3010:4:1:0,ACCT4001:4:1:0,BUSG4101:4:1:0,ACCT4003:4:1:4,ACCT4005:4:1:4,ACCT4007:4:2:0,BUSG4201:4:2:0,MGMT4010:4:2:0,BUSG4301:4:3:0
bba-banking-fintech|business|Bachelor of Business Administration in Banking and Financial Technology|B.B.A. BkFinTech|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-banking-and|2026-2027|General Education Requirement: select 1 of 3~General Education Requirement: select 1 of 2~Elective: select 1 of 2|ACCT1001:1:1:0,COMM1010:1:1:0,MATH1070:1:1:0,EFFL1003:1:1:0,BKFT1001:1:2:0,COMM1020:1:2:0,HRMG1001:1:2:0,INFS1101:1:2:0,COMP1401:1:3:0,BUSG2001:1:3:1,SSHA1004:1:3:1,SSHA1005:1:3:1,ACCT2010:2:1:0,BKFT2001:2:1:0,ECON2010:2:1:0,MRKT1001:2:1:0,ACCT2001:2:2:0,BUSG2010:2:2:0,INFS1201:2:2:0,MATH1060:2:2:0,MISY2010:2:2:0,MGMT2010:2:3:0,ECON1001:2:3:2,GARC2001:2:3:2,BKFT3005:3:1:0,DSAI2201:3:1:0,MGMT3035:3:1:0,BKFT3007:3:2:0,BKFT3010:3:2:0,INFS2201:3:2:0,MGMT4000:3:2:0,RSST3001:3:2:0,MGMT4010:3:3:0,BUSG4101:4:1:0,DACS3202:4:1:0,BKFT4001:4:1:0,BKFT4020:4:1:0,BKFT4010:4:2:0,BUSG4201:4:2:0,BKFT4015:4:2:3,BKFT3001:4:2:3,BUSG4301:4:3:0
bba-digital-marketing|business|Bachelor of Business Administration in Digital Marketing|B.B.A. DMktg|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-digital|2026-2027|General Education Requirement: select 1 of 10~General Education Requirement: select 1 of 6|COMM1010:1:1:0,MATH1070:1:1:0,MRKT1001:1:1:0,EFFL1003:1:1:0,ACCT1001:1:2:0,COMM1020:1:2:0,HRMG1001:1:2:0,BKFT1001:1:3:0,ECON2010:2:1:0,MGMT2010:2:1:0,MISY2010:2:1:0,MRKT2003:2:1:0,ACCT2001:2:2:0,RSST3001:2:2:0,MRKT3104:2:2:0,BUSG2001:2:2:1,BUSG2002:2:2:1,SSHA1001:2:2:1,SSHA1002:2:2:1,SSHA1003:2:2:1,SSHA1004:2:2:1,SSHA1005:2:2:1,SSHA1006:2:2:1,SSHA1007:2:2:1,SSHA2001:2:2:1,MRKT3006:2:3:0,BUSG2010:2:3:0,MGMT3035:3:1:0,MRKT2002:3:1:0,MRKT3008:3:1:0,ECON1001:3:1:2,GARC1001:3:1:2,GARC2001:3:1:2,GARC2002:3:1:2,GARC2003:3:1:2,GARC2004:3:1:2,MRKT3007:3:2:0,MRKT3009:3:2:0,MRKT3105:3:2:0,MRKT3010:3:3:0,MRKT3011:3:3:0,BUSG4101:4:1:0,MGMT4000:4:1:0,MRKT4214:4:1:0,BUSG4201:4:2:0,MGMT4010:4:2:0,MRKT4112:4:2:0,MRKT4213:4:2:0,BUSG4301:4:3:0
bba-healthcare-management|business|Bachelor of Business Administration in Healthcare Management|B.B.A. HCM|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-healthcare|2026-2027|General Education Requirement: select 1 of 38~General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 9|COMM1010:1:1:0,MATH1070:1:1:0,HRMG1001:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,ACCT1001:1:2:0,HCMT1001:1:2:0,BIOL1001:1:2:1,BIOL1002:1:2:1,BIOL1003:1:2:1,BIOL1030:1:2:1,BIOL1031:1:2:1,BIOL1110:1:2:1,BIOL1111:1:2:1,BIOL1210:1:2:1,BIOL1211:1:2:1,BIOL2010:1:2:1,BIOL2011:1:2:1,CHEM1010:1:2:1,CHEM1011:1:2:1,CHEM1020:1:2:1,CHEM1021:1:2:1,CHEM1030:1:2:1,CHEM1031:1:2:1,CHEM1040:1:2:1,CHEM1041:1:2:1,CHEM3010:1:2:1,CHEM3011:1:2:1,COMP1401:1:2:1,INFT2102:1:2:1,MATH1010:1:2:1,MATH1020:1:2:1,MATH1030:1:2:1,MATH1040:1:2:1,MATH1050:1:2:1,MATH1060:1:2:1,MATH2002:1:2:1,MATH2010:1:2:1,PHYS1020:1:2:1,PHYS1021:1:2:1,PHYS1030:1:2:1,SCIE1001:1:2:1,SCIE1002:1:2:1,BIOL1070:1:2:1,BKFT1001:1:3:0,HCMT2001:2:1:0,MGMT2010:2:1:0,MISY2010:2:1:0,ECON1001:2:1:2,GARC1001:2:1:2,GARC2001:2:1:2,GARC2002:2:1:2,GARC2003:2:1:2,GARC2004:2:1:2,ACCT2001:2:2:0,ECON2010:2:2:0,MRKT1001:2:2:0,BUSG2010:2:2:0,RSST3001:2:3:0,BUSG2001:2:3:3,SSHA1001:2:3:3,SSHA1002:2:3:3,SSHA1003:2:3:3,SSHA1004:2:3:3,SSHA1005:2:3:3,SSHA1006:2:3:3,SSHA1007:2:3:3,SSHA2001:2:3:3,MGMT3035:3:1:0,HCMT3001:3:1:0,HCMT3002:3:1:0,HCMT3003:3:1:0,HCMT3004:3:2:0,HRMG2020:3:2:0,HCMT3005:3:2:0,HCMT3006:3:2:0,BUSG2002:3:3:0,HCMT3007:3:3:0,MGMT4000:4:1:0,HCMT4008:4:1:0,BUSG4101:4:1:0,MGMT4010:4:2:0,HCMT4009:4:2:0,MRKT3006:4:2:0,BUSG4201:4:2:0,BUSG4301:4:3:0
bba-human-resource-management|business|Bachelor of Business Administration in Human Resource Management|B.B.A. HRM|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-human-resource|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 8~Elective: select 1 of 2|COMM1010:1:1:0,HRMG1001:1:1:0,MATH1070:1:1:0,EFFL1003:1:1:0,ACCT1001:1:2:0,COMM1020:1:2:0,COMP1401:1:2:0,MRKT1001:1:2:0,BKFT1001:1:3:0,ECON1001:1:3:1,GARC1001:1:3:1,GARC2001:1:3:1,GARC2002:1:3:1,GARC2003:1:3:1,GARC2004:1:3:1,ECON2010:2:1:0,HRMG2020:2:1:0,MISY2010:2:1:0,BUSG2001:2:1:2,SSHA1001:2:1:2,SSHA1002:2:1:2,SSHA1003:2:1:2,SSHA1004:2:1:2,SSHA1005:2:1:2,SSHA1006:2:1:2,SSHA1007:2:1:2,ACCT2001:2:2:0,BUSG2010:2:2:0,MGMT2010:2:2:0,RSST3001:2:2:0,BUSG2002:2:3:0,SCIE1002:2:3:0,HRMG3010:3:1:0,HRMG3020:3:1:0,MGMT3035:3:1:0,HRMG3030:3:2:0,HRMG3040:3:2:0,HRMG3050:3:2:0,HRMG3060:3:2:0,MGMT4000:3:3:0,MGMT4010:3:3:0,BUSG4101:4:1:0,HRMG4040:4:1:0,HRMG4092:4:1:0,HRMG4081:4:1:3,HRMG4091:4:1:3,HRMG4083:4:1:3,HRMG4093:4:1:3,BUSG4201:4:2:0,HRMG4010:4:2:0,HRMG4030:4:2:0,HRMG4084:4:2:3,HRMG4094:4:2:3,BUSG4301:4:3:0
bba-logistics-supply-chain|business|Bachelor of Business Administration in Logistics and Supply Chain Management|B.B.A. LSCM|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-business-administration-logistics-and|2026-2027|General Education Requirement: select 1 of 7~General Education Requirement: select 1 of 9|COMM1010:1:1:0,LSCM1001:1:1:0,MATH1070:1:1:0,EFFL1003:1:1:0,ACCT1001:1:2:0,COMM1020:1:2:0,COMP1401:1:2:0,CUBM1001:1:2:0,BKFT1001:1:3:0,HRMG1001:1:3:0,ECON2010:2:1:0,CUBM2001:2:1:0,MISY2010:2:1:0,ECON1001:2:1:1,GARC1001:2:1:1,GARC2001:2:1:1,GARC2002:2:1:1,GARC2003:2:1:1,GARC2004:2:1:1,CUBM2010:2:1:1,BUSG2010:2:2:0,MGMT2010:2:2:0,RSST3001:2:2:0,MRKT1001:2:2:0,BUSG2002:2:3:0,SCIE1002:2:3:0,LSCM3020:3:1:0,MGMT3035:3:1:0,LSCM3010:3:1:0,BUSG2001:3:1:2,SSHA1001:3:1:2,SSHA1002:3:1:2,SSHA1003:3:1:2,SSHA1004:3:1:2,SSHA1005:3:1:2,SSHA1006:3:1:2,SSHA1007:3:1:2,SSHA2001:3:1:2,LSCM3040:3:2:0,LSCM4081:3:2:0,LSCM3030:3:2:0,LSCM3050:3:2:0,MGMT4000:3:3:0,LSCM4082:3:3:0,BUSG4101:4:1:0,LSCM4010:4:1:0,LSCM4021:4:1:0,LSCM4083:4:1:0,LSCM4030:4:2:0,BUSG4201:4:2:0,MGMT4010:4:2:0,LSCM4084:4:2:0,BUSG4301:4:3:0
digital-communication-media-production|computing-and-it|Bachelor of Science in Digital Communication and Media Production – English Track|B.Sc. DCMP|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/bachelor-science-0|2026-2027|General Education Requirement: select 1 of 3~General Education Requirement: select 1 of 8~Elective: select 1 of 2|COMM1010:1:1:0,COMP1401:1:1:0,MATH1010:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,DCMP1001:1:2:0,DCMP1003:1:2:0,GARC1001:1:2:0,MRKT1001:1:3:0,SCIE1001:1:3:1,SCIE1002:1:3:1,BIOL1070:1:3:1,DCMP2001:2:1:0,DCMP2010:2:1:0,DCMP2015:2:1:0,DCMP2035:2:1:0,MRKT2003:2:1:0,DCMP2005:2:2:0,DCMP2030:2:2:0,DCMP2045:2:2:0,SSHA1001:2:2:2,SSHA1002:2:2:2,SSHA1003:2:2:2,SSHA1004:2:2:2,SSHA1005:2:2:2,SSHA1006:2:2:2,SSHA1007:2:2:2,SSHA2001:2:2:2,DCMP2040:2:3:0,DCMP2060:2:3:0,DCMP2025:3:1:0,DCMP3010:3:1:0,DCMP3020:3:1:0,DCMP3021:3:1:0,DCMP2050:3:2:0,DCMP3005:3:2:0,DCMP3032:3:2:0,DCMP3050:3:2:0,MGMT2010:3:3:0,MRKT3105:3:3:0,COMM3010:4:1:0,COMP4101:4:1:0,DCMP4006:4:1:0,DCMP4015:4:1:0,COMP4201:4:2:0,DCMP4025:4:2:0,MGMT4010:4:2:0,DCMP4040:4:2:3,DCMP4045:4:2:3,COMP4301:4:3:0
information-systems|computing-and-it|Bachelor of Science in Information Systems|B.Sc. IS|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/bachelor-science-1|2026-2027|General Education Requirement: select 1 of 3~General Education Requirement: select 1 of 7~General Education Requirement: select 1 of 6~Elective: select 1 of 3|COMM1010:1:1:0,INFS1101:1:1:0,EFFL1003:1:1:0,SCIE1001:1:1:1,SCIE1002:1:1:1,BIOL1070:1:1:1,COMM1020:1:2:0,INFS1201:1:2:0,INFS1202:1:2:0,MATH1030:1:2:0,INFS1301:1:3:0,INFS2101:2:1:0,INFT2101:2:1:0,INFT2102:2:1:0,MATH1040:2:1:0,DACS2201:2:2:0,DSAI2201:2:2:0,INFS2201:2:2:0,INFS3102:2:2:0,SOFT2301:2:3:0,SSHA1001:2:3:2,SSHA1002:2:3:2,SSHA1003:2:3:2,SSHA1004:2:3:2,SSHA1005:2:3:2,SSHA1006:2:3:2,SSHA1007:2:3:2,INFT2202:3:1:0,INFS3103:3:1:0,INFS3104:3:1:0,ECON1001:3:1:3,GARC1001:3:1:3,GARC2001:3:1:3,GARC2002:3:1:3,GARC2003:3:1:3,GARC2004:3:1:3,INFS3201:3:2:0,INFS3202:3:2:0,INFS3203:3:2:0,INFT3203:3:2:0,INFS3301:3:3:0,COMP4101:4:1:0,INFS4202:4:1:0,INFS4104:4:1:0,INFS4106:4:1:0,INFS4102:4:1:4,INFS4105:4:1:4,DACS4102:4:1:4,COMP4201:4:2:0,INFS4101:4:2:0,DSAI3301:4:2:0,DACS3203:4:2:4,INFS4205:4:2:4,INFS4206:4:2:4,COMP4301:4:3:0
information-technology|computing-and-it|Bachelor of Science in Information Technology|B.Sc. IT|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/bachelor-science-2|2026-2027|General Education Requirement: select 1 of 2~General Education Requirement: select 1 of 8~Elective - Global Awareness and Regional Challenges: select 1 of 6~Elective: select 1 of 3~Elective: select 2 of 6|COMM1010:1:1:0,INFS1101:1:1:0,EFFL1003:1:1:0,SCIE1001:1:1:1,SCIE1002:1:1:1,COMM1020:1:2:0,INFS1201:1:2:0,INFT1201:1:2:0,MATH1030:1:2:0,INFS1301:1:3:0,INFS2101:2:1:0,INFT2101:2:1:0,INFT2102:2:1:0,MATH1040:2:1:0,DACS2201:2:2:0,DSAI2201:2:2:0,INFS2201:2:2:0,INFT2202:2:2:0,SOFT2301:2:3:0,SSHA1001:2:3:2,SSHA1002:2:3:2,SSHA1003:2:3:2,SSHA1004:2:3:2,SSHA1005:2:3:2,SSHA1006:2:3:2,SSHA1007:2:3:2,SSHA2001:2:3:2,INFT3100:3:1:0,INFT3101:3:1:0,INFT3102:3:1:0,ECON1001:3:1:3,GARC1001:3:1:3,GARC2001:3:1:3,GARC2002:3:1:3,GARC2003:3:1:3,GARC2004:3:1:3,INFT3200:3:2:0,DACS3201:3:2:0,INFT3201:3:2:0,INFT3202:3:2:0,INFT3301:3:3:0,COMP4101:4:1:0,DSAI4104:4:1:0,INFT4107:4:1:0,INFT4203:4:1:4,INFT4106:4:1:4,INFT4108:4:1:4,INFT4105:4:2:0,COMP4201:4:2:0,DACS4204:4:2:5,INFT4103:4:2:5,INFT4104:4:2:5,INFT4201:4:2:5,INFT3203:4:2:5,INFT4208:4:2:5,COMP4301:4:3:0
aeronautical-engineering|engineering-and-technology|Bachelor of Science in Aeronautical Engineering|B.Sc. AeroE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-aeronautical|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 7|COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,EFFL1003:1:1:0,AERO1000:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,AERO1332:1:2:0,AEMA1312:1:2:0,AEPC1203:1:2:0,COMM1020:1:2:0,MATH2010:1:3:0,AECH1100:1:3:0,BIOL1001:1:3:1,BIOL1002:1:3:1,BIOL1003:1:3:1,EASC1001:1:3:1,PHYS2001:1:3:1,CHEM3050:1:3:1,AEMA1113:2:1:0,AEMA1213:2:1:0,AEMA1303:2:1:0,AEMA2311:2:1:0,AERO2321:2:1:0,AERO2123:2:1:0,MATH3010:2:1:0,AERO2311:2:2:0,AEMA2142:2:2:0,AERO2333:2:2:0,AERO2322:2:2:0,AERO2122:2:2:0,AERO2222:2:2:0,AETN2302:2:2:0,MATH3020:2:3:0,ECON1001:2:3:2,AECH2112:2:3:2,GARC1001:2:3:2,GARC2001:2:3:2,GARC2002:2:3:2,GARC2003:2:3:2,GARC2004:2:3:2,AEMA2333:3:1:0,AERO2103:3:1:0,AERO2203:3:1:0,AERO3101:3:1:0,AERO3201:3:1:0,AERO3305:3:1:0,AERO3344:3:1:0,MATH3030:3:2:0,AERO3121:3:2:0,AERO3221:3:2:0,AERO3311:3:2:0,AERO3133:3:2:0,AERO4131:3:2:0,AERO3000:3:3:0,AERO3322:4:1:0,AERO4100:4:1:0,COMM3010:4:1:0,AERO4301:4:1:0,AERO4211:4:2:0,AERO4132:4:2:0,AERO4200:4:2:0,AERO4302:4:2:0
animal-health-veterinary-sciences|health-sciences|Bachelor of Science in Animal Health & Veterinary Sciences|B.Sc.AHVS|https://www.udst.edu.qa/bachelor-science-animal-health-veterinary-sciences-bscahvs|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 8|BIOL1100:1:1:0,BIOL1101:1:1:0,COMM1010:1:1:0,HSVS1000:1:1:0,HSVS1110:1:1:0,MATH1010:1:1:0,BIOL1030:1:2:0,BIOL1031:1:2:0,BIOL1230:1:2:0,BIOL1231:1:2:0,HSVS1200:1:2:0,HSVS1210:1:2:0,HSVS1220:1:2:0,BIOL1330:1:3:0,BIOL1331:1:3:0,HSVS1320:1:3:0,HSVS1350:1:3:0,HSVS2010:2:1:0,HSVS2100:2:1:0,HSVS2110:2:1:0,HSVS2120:2:1:0,HSVS2130:2:1:0,HSVS2140:2:1:0,HSVS2210:2:2:0,HSVS2220:2:2:0,HSVS2230:2:2:0,HSVS2240:2:2:0,HSVS2250:2:2:0,HSVS2350:2:3:0,BIOL3130:3:1:0,HSVS3110:3:1:0,HSVS3120:3:1:0,MATH2002:3:1:0,ECON1001:3:1:1,GARC1001:3:1:1,GARC2001:3:1:1,GARC2002:3:1:1,GARC2003:3:1:1,GARC2004:3:1:1,COMM1020:3:2:0,HSOH2050:3:2:0,HSVS3210:3:2:0,HSVS3250:3:2:0,HSVS3310:3:3:0,SSHA1001:3:3:2,SSHA1002:3:3:2,SSHA1003:3:3:2,SSHA1004:3:3:2,SSHA1005:3:3:2,SSHA1006:3:3:2,SSHA1007:3:3:2,SSHA2001:3:3:2,BIOL4140:4:1:0,HSHG4101:4:1:0,HSVS4110:4:1:0,HSVS4120:4:1:0,HSVS4250:4:2:0
aviation-management|business|Bachelor of Science in Aviation Management|B.Sc. AVM|https://www.udst.edu.qa/academic/our-colleges/college-business/bachelor-science-aviation-management-bsc-avm|2026-2027|General Education Requirement: select 1 of 9~General Education Requirement: select 1 of 6|COMM1010:1:1:0,AVMG1001:1:1:0,INFS1101:1:1:0,MATH1030:1:1:0,EFFL1003:1:1:0,ACCT1001:1:2:0,COMM1020:1:2:0,PHYS1020:1:2:0,PHYS1021:1:2:0,MRKT1001:1:2:0,BUSG2001:1:2:1,SSHA1001:1:2:1,SSHA1002:1:2:1,SSHA1003:1:2:1,SSHA1004:1:2:1,SSHA1005:1:2:1,SSHA1006:1:2:1,SSHA1007:1:2:1,SSHA2001:1:2:1,SCIE1002:1:3:0,HRMG1001:1:3:0,ECON2010:2:1:0,BUSG2002:2:1:0,AVMG2001:2:1:0,MISY2010:2:1:0,BKFT1001:2:1:0,INFS1201:2:2:0,MGMT2010:2:2:0,HRMG3030:2:2:0,AVMG2002:2:2:0,RSST3001:2:2:0,BUSG2010:2:3:0,ECON1001:2:3:2,GARC1001:2:3:2,GARC2001:2:3:2,GARC2002:2:3:2,GARC2003:2:3:2,GARC2004:2:3:2,AVMG3001:3:1:0,AVMG3002:3:1:0,AVMG3003:3:1:0,ACCT2001:3:1:0,AVMG3004:3:2:0,AVMG3005:3:2:0,AVMG3006:3:2:0,AVMG3007:3:2:0,AVMG3008:3:3:0,AVMG3009:3:3:0,AVMG4301:4:1:0,AVMG4001:4:1:0,AVMG4002:4:1:0,MGMT4010:4:1:0,AVMG4302:4:2:0,AVMG4003:4:2:0,AVMG4004:4:2:0,AVMG4303:4:3:0
chemical-engineering-processing|engineering-and-technology|Bachelor of Science in Chemical Engineering – Processing Engineering|B.Sc. CE-PE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-chemical|2026-2027|General Education Requirement: select 1 of 8|CHEM1010:1:1:0,CHEM1011:1:1:0,COMM1010:1:1:0,EFFL1003:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,MATH1030:1:1:0,AECH1112:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,AEMA1312:1:2:0,CHEM1020:1:2:0,CHEM1021:1:2:0,MATH2010:1:2:0,AECH1100:1:3:0,AECH1103:1:3:0,AEPC1203:1:3:0,AECH2111:2:1:0,AECH2121:2:1:0,AECH2241:2:1:0,AECH2331:2:1:0,AECH2131:2:1:0,AECH2122:2:2:0,AECH2142:2:2:0,AECH2332:2:2:0,COMM1020:2:2:0,AECH2251:2:2:0,CHEM2010:2:2:0,CHEM2011:2:2:0,AECH2103:2:3:0,AECH2112:2:3:0,AECH2113:2:3:0,AECH3101:3:1:0,AEMA3142:3:1:0,AECH3132:3:1:0,AECH3321:3:1:0,MATH3030:3:1:0,AECH3222:3:2:0,AECH3302:3:2:0,AECH4210:3:2:0,AECH4221:3:2:0,AECH4232:3:2:0,AETN2302:3:2:0,AECH3000:3:3:0,AECH4301:4:1:0,MATH3020:4:1:0,AECH4211:4:1:0,AEMA4100:4:1:0,COMM3010:4:1:0,AECH4112:4:2:0,AECH4122:4:2:0,AECH4302:4:2:0,BUSG2001:4:2:1,SSHA1001:4:2:1,SSHA1002:4:2:1,SSHA1003:4:2:1,SSHA1004:4:2:1,SSHA1005:4:2:1,SSHA1006:4:2:1,SSHA1007:4:2:1
construction-engineering|engineering-and-technology|Bachelor of Science in Construction Engineering|B.Sc. ConE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-construction|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 7|COMM1010:1:1:0,MATH1050:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1003:1:1:0,AECE1200:1:2:0,AECE1230:1:2:0,AECE1260:1:2:0,AECH1100:1:2:0,CHEM1010:1:2:0,CHEM1011:1:2:0,MATH2010:1:2:0,AECE1340:1:3:0,AEPC1203:1:3:0,BIOL1001:1:3:1,BIOL1002:1:3:1,BIOL1003:1:3:1,EASC1001:1:3:1,PHYS2001:1:3:1,CHEM3050:1:3:1,AECE2100:2:1:0,AECE2110:2:1:0,AECE2120:2:1:0,AECE2130:2:1:0,AECE2131:2:1:0,AECE2140:2:1:0,PHYS1040:2:1:0,PHYS1041:2:1:0,AECE2210:2:2:0,AECE2220:2:2:0,AECE2230:2:2:0,AECE2231:2:2:0,MATH3020:2:2:0,COMM1020:2:2:0,AETN2302:2:3:0,AECH2103:2:3:2,ECON1001:2:3:2,GARC1001:2:3:2,GARC2001:2:3:2,GARC2002:2:3:2,GARC2003:2:3:2,GARC2004:2:3:2,AECE3100:3:1:0,AECE3101:3:1:0,AECE3120:3:1:0,AEMA3121:3:1:0,AEMA3221:3:1:0,MATH3030:3:1:0,AECE3210:3:2:0,AECE4111:3:2:0,AECE3230:3:2:0,AECH2112:3:2:0,AECH2113:3:2:0,AECE3000:3:3:0,AECE4100:4:1:0,AECE4140:4:1:0,AECE4110:4:1:0,AECE4120:4:1:0,AECE4130:4:1:0,COMM3010:4:1:0,AECE4200:4:2:0,AECE4210:4:2:0,AECE4220:4:2:0,AECE4230:4:2:0
dental-hygiene|health-sciences|Bachelor of Science in Dental Hygiene|B.Sc. DH|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-dental-hygiene-bsc-dh|2026-2027|General Education Requirement: select 1 of 6|BIOL1030:1:1:0,BIOL1031:1:1:0,BIOL1110:1:1:0,BIOL1111:1:1:0,CHEM1050:1:1:0,COMM1010:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,HSDH1270:1:2:0,PHYS1050:1:2:0,RSST1001:1:2:0,SSHA1002:1:2:0,BIOL1310:1:3:0,COMM1020:1:3:0,SSHA1003:1:3:0,HSHG2020:2:1:0,HSDH2140:2:1:0,HSDH2120:2:1:0,HSDH2130:2:1:0,MATH2002:2:1:0,HSDH2250:2:2:0,HSDH2260:2:2:0,HSDH2240:2:2:0,HSDH2210:2:2:0,HSDH2280:2:2:0,HSDH2350:2:3:0,HSDH2390:2:3:0,HSDH3100:3:1:0,HSDH3150:3:1:0,HSDH3160:3:1:0,HSDH3181:3:1:0,HSDH3200:3:2:0,HSDH3241:3:2:0,HSDH3250:3:2:0,HSDH3260:3:2:0,HSDH3350:3:3:0,HSDH3360:3:3:0,ECON1001:3:3:1,GARC1001:3:3:1,GARC2001:3:3:1,GARC2002:3:3:1,GARC2003:3:3:1,GARC2004:3:3:1,HSDH3371:4:1:0,HSDH4150:4:1:0,HSDH4160:4:1:0,HSDH4190:4:1:0,HSHG4101:4:1:0,HSDH4250:4:2:0,HSDH4260:4:2:0,HSDH4290:4:2:0,HSDH4340:4:2:0
digital-communication-media-production-arabic|computing-and-it|Bachelor of Science in Digital Communication and Media Production – Arabic – English Track|B.Sc. DCMP|https://www.udst.edu.qa/bachelor-science-digital-communication-and-media-production-arabic-english-track-bsc-dcmp|2026-2027|Elective: select 1 of 3~General Education Requirement: select 1 of 8~Elective: select 1 of 2|COMM1010:1:1:0,COMP1401:1:1:0,MATH1010:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,DCMP1001A:1:2:0,DCMP1003A:1:2:0,MRKT1001:1:3:0,SCIE1001:1:3:1,SCIE1002:1:3:1,BIOL1070:1:3:1,DCMP2001A:2:1:0,DCMP2010A:2:1:0,DCMP2015:2:1:0,DCMP2035A:2:1:0,MRKT2003:2:1:0,DCMP2005A:2:2:0,DCMP2030A:2:2:0,DCMP2045A:2:2:0,SSHA1001:2:2:2,SSHA1002:2:2:2,SSHA1003:2:2:2,SSHA1004:2:2:2,SSHA1005:2:2:2,SSHA1006:2:2:2,SSHA1007:2:2:2,SSHA2001:2:2:2,DCMP2040A:2:3:0,DCMP2060A:2:3:0,DCMP2025:3:1:0,DCMP3010:3:1:0,DCMP3020:3:1:0,DCMP3021A:3:1:0,DCMP2050A:3:2:0,DCMP3005A:3:2:0,DCMP3032:3:2:0,DCMP3050A:3:2:0,MGMT2010:3:3:0,MRKT3105A:3:3:0,COMM3010A:4:1:0,COMP4101:4:1:0,DCMP4006:4:1:0,DCMP4015A:4:1:0,COMP4201:4:2:0,DCMP4025:4:2:0,MGMT4010:4:2:0,DCMP4040:4:2:3,DCMP4045:4:2:3,COMP4301:4:3:0
data-science-ai|computing-and-it|Bachelor of Science in Data Science and Artificial Intelligence|B.Sc. DSAI|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/bachelor-science-dsai|2026-2027|General Education Requirement: select 1 of 3~Elective - Social Sciences, Humanities, & the Arts: select 1 of 8~General Education Requirement: select 1 of 6~Elective: select 1 of 2~Elective: select 2 of 4|COMM1010:1:1:0,INFS1101:1:1:0,MATH1030:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,INFS1201:1:2:0,DACS2101:1:2:0,MATH1040:1:2:0,INFS1301:1:3:0,SCIE1001:1:3:1,SCIE1002:1:3:1,BIOL1070:1:3:1,DSAI2201:2:1:0,INFT2101:2:1:0,DACS2202:2:1:0,MATH1050:2:1:0,DACS2201:2:2:0,DSAI3201:2:2:0,INFS2201:2:2:0,INFS3102:2:2:0,SOFT2301:2:3:0,SSHA1001:2:3:2,SSHA1002:2:3:2,SSHA1003:2:3:2,SSHA1004:2:3:2,SSHA1005:2:3:2,SSHA1006:2:3:2,SSHA1007:2:3:2,SSHA2001:2:3:2,DSAI4101:3:1:0,INFS3104:3:1:0,DSAI3203:3:1:0,ECON1001:3:1:3,GARC1001:3:1:3,GARC2001:3:1:3,GARC2002:3:1:3,GARC2003:3:1:3,GARC2004:3:1:3,DSAI3301:3:2:0,DSAI3202:3:2:0,DSAI4104:3:2:0,DSAI3205:3:2:0,DSAI3302:3:3:0,COMP4101:4:1:0,DSAI4103:4:1:0,DSAI4109:4:1:0,DSAI4107:4:1:4,DSAI4108:4:1:4,COMP4201:4:2:0,DSAI4209:4:2:0,DSAI4201:4:2:5,DSAI4202:4:2:5,DSAI4207:4:2:5,DSAI4208:4:2:5,COMP4301:4:3:0
electrical-engineering-automation-control|engineering-and-technology|Bachelor of Science in Electrical Engineering – Automation and Control Systems Engineering|B.Sc. EE-ACSE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-electrical-0|2026-2027||AEMA1312:1:1:0,COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1003:1:1:0,MATH2010:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,MATH1050:1:2:0,AEEL1101:1:2:0,AEEL1201:1:2:0,AECH1100:1:2:0,AEPC1203:1:3:0,CHEM1010:1:3:0,CHEM1011:1:3:0,AETN1102:2:1:0,AETN1202:2:1:0,AETN1112:2:1:0,AETN1212:2:1:0,AEEL1102:2:1:0,AEEL1202:2:1:0,MATH3010:2:1:0,AETN2101:2:2:0,AETN2201:2:2:0,MATH3020:2:2:0,COMM1020:2:2:0,AEEP2301:2:2:0,AEEP2111:2:2:0,AEEP2211:2:2:0,AEAC2101:2:3:0,AEAC2201:2:3:0,AEEP2122:2:3:0,AEEP2222:2:3:0,AECH2112:3:1:0,AEAC3101:3:1:0,AEAC3201:3:1:0,AEAC2102:3:1:0,AEAC2202:3:1:0,MATH3030:3:1:0,AEAC2113:3:1:0,AEAC2213:3:1:0,AEAC2103:3:2:0,AEAC2203:3:2:0,AEAC3102:3:2:0,AEAC3202:3:2:0,AEAC3112:3:2:0,AEAC3212:3:2:0,AEEP3112:3:2:0,AEEP3212:3:2:0,AEAC3000:3:3:0,AETN4301:4:1:0,AEEP4100:4:1:0,COMM3010:4:1:0,AEAC4102:4:1:0,AEAC4202:4:1:0,AEAC4101:4:1:0,AEAC4201:4:1:0,AETN4302:4:2:0,AEAC3111:4:2:0,AEAC3211:4:2:0,AEAC4112:4:2:0,AEAC4212:4:2:0
electrical-engineering-power-renewable|engineering-and-technology|Bachelor of Science in Electrical Engineering – Electrical Power and Renewable Energy Engineering|B.Sc. EE–EPREE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-electrical-1|2026-2027||AEMA1312:1:1:0,COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1003:1:1:0,MATH2010:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,MATH1050:1:2:0,AEEL1101:1:2:0,AEEL1201:1:2:0,AECH1100:1:2:0,AEPC1203:1:3:0,CHEM1010:1:3:0,CHEM1011:1:3:0,AETN1102:2:1:0,AETN1202:2:1:0,AETN1112:2:1:0,AETN1212:2:1:0,AEEL1102:2:1:0,AEEL1202:2:1:0,MATH3010:2:1:0,AETN2101:2:2:0,AETN2201:2:2:0,MATH3020:2:2:0,COMM1020:2:2:0,AEEP2301:2:2:0,AEEP2111:2:2:0,AEEP2211:2:2:0,AEEP2113:2:3:0,AEEP2213:2:3:0,AEEP2122:2:3:0,AEEP2222:2:3:0,AEAC3101:3:1:0,AEAC3201:3:1:0,AEEP2102:3:1:0,AEEP2202:3:1:0,AEEP2212:3:1:0,AEEP3102:3:1:0,AEEP3202:3:1:0,AECH2112:3:1:0,AEAC2113:3:2:0,AEAC2213:3:2:0,AEEP2103:3:2:0,AEEP2203:3:2:0,AEEP3111:3:2:0,AEEP3211:3:2:0,AEEP3112:3:2:0,AEEP3212:3:2:0,AETN3203:3:3:0,AEEP4100:4:1:0,AEEP4301:4:1:0,COMM3010:4:1:0,AEEP3122:4:1:0,AEEP3222:4:1:0,MATH3030:4:1:0,AEEP4302:4:2:0,AEEP4111:4:2:0,AEEP4211:4:2:0,AEEP4122:4:2:0,AEEP4112:4:2:0,AEEP4212:4:2:0
electrical-engineering-telecom-network|engineering-and-technology|Bachelor of Science in Electrical Engineering – Telecommunications and Network Engineering|B.Sc. EE-TNE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-electrical|2026-2027||AEMA1312:1:1:0,COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1003:1:1:0,MATH2010:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,MATH1050:1:2:0,AEEL1101:1:2:0,AEEL1201:1:2:0,AECH1100:1:2:0,AEPC1203:1:3:0,CHEM1010:1:3:0,CHEM1011:1:3:0,AETN1102:2:1:0,AETN1202:2:1:0,AETN1112:2:1:0,AETN1212:2:1:0,AEEL1102:2:1:0,AEEL1202:2:1:0,MATH3010:2:1:0,AETN2101:2:2:0,AETN2201:2:2:0,MATH3020:2:2:0,COMM1020:2:2:0,AEEP2301:2:2:0,AETN2111:2:2:0,AETN2211:2:2:0,AEAC3101:2:3:0,AEAC3201:2:3:0,AEEL2201:2:3:0,AECH2112:3:1:0,AETN2121:3:1:0,AETN2221:3:1:0,AETN3111:3:1:0,AETN4101:3:1:0,MATH3030:3:1:0,AETN3221:3:2:0,AETN3222:3:2:0,AETN2112:3:2:0,AETN2212:3:2:0,AETN2122:3:2:0,AETN2222:3:2:0,AETN3203:3:3:0,AEEP4100:4:1:0,AETN4301:4:1:0,COMM3010:4:1:0,AETN3102:4:1:0,AETN3202:4:1:0,AETN3101:4:1:0,AETN3201:4:1:0,AETN3122:4:1:0,AETN4112:4:2:0,AETN4212:4:2:0,AETN4121:4:2:0,AETN4221:4:2:0,AETN4302:4:2:0,AETN3112:4:2:0
environmental-health|health-sciences|Bachelor of Science in Environmental Health|B.Sc. EH|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-environmental-health|2026-2027|Elective - Social Sciences, Humanities, and the Arts: select 1 of 7~Elective: select 1 of 4~Elective: select 1 of 8|BIOL1110:1:1:0,BIOL1030:1:1:0,BIOL1031:1:1:0,COMM1010:1:1:0,HSEH1110:1:1:0,BIOL1210:1:2:0,CHEM1030:1:2:0,CHEM1031:1:2:0,COMM1020:1:2:0,PHYS1030:1:2:0,PHYS1031:1:2:0,HSEH1310:1:3:0,SSHA1001:1:3:1,SSHA1002:1:3:1,SSHA1003:1:3:1,SSHA1004:1:3:1,SSHA1005:1:3:1,SSHA1006:1:3:1,SSHA2001:1:3:1,HSEH2120:2:1:0,HSEH2130:2:1:0,HSOH1100:2:1:0,MATH2002:2:1:0,HSEH2210:2:2:0,HSOH2102:2:2:0,HSOH1200:2:2:0,RSST1001:2:2:0,HSOH2050:2:3:0,HSEH2320:2:3:0,HSEH3240:3:1:0,HSEH3120:3:1:0,HSEH3230:3:1:0,HSEH3141:3:1:0,HSEH3210:3:2:0,HSEH3220:3:2:0,HSEH3250:3:2:0,ECON1001:3:2:2,GARC1001:3:2:2,GARC2001:3:2:2,GARC2002:3:2:2,HSEH3310:3:3:0,HSEH4110:4:1:0,HSEH4120:4:1:0,HSEH4130:4:1:0,BUSG2001:4:1:3,BUSG2002:4:1:3,HSOH2300:4:1:3,HSOH3300:4:1:3,SCIE1002:4:1:3,HSEH4310:4:2:0,HSEH4210:4:2:0,HSEH4230:4:2:0
marine-engineering|engineering-and-technology|Bachelor of Science in Marine Engineering|B.Sc. MrnE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-marine|2026-2027|General Education Requirement: select 1 of 6|AEMR1000:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,COMM1010:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,MATH1030:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,AECH1100:1:2:0,AEMR1102:1:2:0,AEEL1101:1:2:0,AEEL1201:1:2:0,MATH2010:1:2:0,AEMA1113:1:3:0,AEMA1213:1:3:0,AEMA1303:1:3:0,BIOL1001:1:3:1,BIOL1002:1:3:1,BIOL1003:1:3:1,EASC1001:1:3:1,PHYS2001:1:3:1,CHEM3050:1:3:1,AEEL1102:2:1:0,AEEL1202:2:1:0,AETN1112:2:1:0,AETN1212:2:1:0,AEMA1312:2:1:0,AEMA2121:2:1:0,AEMA2221:2:1:0,AEMA2133:2:1:0,AEMA2233:2:1:0,AEPC1203:2:2:0,AECH2112:2:2:0,AETN2302:2:2:0,MATH3010:2:2:0,AEMA3301:2:2:0,AECH3302:2:2:0,AECH2103:2:3:0,AECH2113:2:3:0,AEMA2311:2:3:0,MATH3020:3:1:0,MATH3030:3:1:0,AEMA3121:3:1:0,AEMA3221:3:1:0,AEMR3302:3:1:0,COMM3010:3:2:0,AEMR3105:3:2:0,AEMR3111:3:2:0,AEMR3112:3:2:0,AEMR3303:3:2:0,AEMA4142:3:2:0,AEMR3000:3:3:0,AEMA4100:4:1:0,AEMR4101:4:1:0,AEMR4103:4:1:0,AEMR4112:4:1:0,AEMR4301:4:1:0,AEMR4311:4:1:0,AEMR4104:4:2:0,AEMR4106:4:2:0,AEMR4108:4:2:0,AEMR4110:4:2:0,AEMR4114:4:2:0,AEMR4302:4:2:0
me-smart-manufacturing|engineering-and-technology|Bachelor of Science in Mechanical Engineering – Smart Manufacturing Engineering|B.Sc. ME-SME|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-mechanical-0|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 7~Elective: select 1 of 3|AEMA1000:1:1:0,COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,MATH2010:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,AEMA1312:1:2:0,AEMA1113:1:2:0,AEMA1213:1:2:0,AEMA1303:1:2:0,AEPC1203:1:3:0,COMM1020:1:3:0,EFFL1003:1:3:0,AEMA1332:2:1:0,MATH3020:2:1:0,AEMA2341:2:1:0,AEMA2121:2:1:0,AEMA2221:2:1:0,AETN2302:2:1:0,AEMA2333:2:2:0,AEMA2343:2:2:0,MATH3030:2:2:0,AEMA2348:2:2:0,AEMA3302:2:2:0,AECH1100:2:3:0,BIOL1001:2:3:1,BIOL1002:2:3:1,BIOL1003:2:3:1,EASC1001:2:3:1,PHYS2001:2:3:1,CHEM3050:2:3:1,MATH3010:3:1:0,AEMA4312:3:1:0,AEMA3232:3:1:0,AEMA3347:3:1:0,AEMA3331:3:1:0,AECH2112:3:1:2,ECON1001:3:1:2,GARC1001:3:1:2,GARC2001:3:1:2,GARC2002:3:1:2,GARC2003:3:1:2,GARC2004:3:1:2,AEMA3348:3:2:0,AEMA4342:3:2:0,AEMA3133:3:2:0,AEMA3342:3:2:0,AEMA3355:3:2:0,AEMA3000:3:3:0,COMM3010:4:1:0,AEMA4100:4:1:0,AEMA4151:4:1:0,AEMA4351:4:1:0,AEMA4301:4:1:0,AEMA4112:4:2:0,AEMA4302:4:2:0,AEMA4343:4:2:3,AEMA4341:4:2:3,AEMA3351:4:2:3
mechanical-engineering-maintenance|engineering-and-technology|Bachelor of Science in Mechanical Engineering – Maintenance Engineering|B.Sc. ME-MaE|https://www.udst.edu.qa/academic/our-colleges/college-engineering-and-technology/bachelor-science-mechanical|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 1 of 7~Elective: select 1 of 3|AEMA1000:1:1:0,COMM1010:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,MATH2010:1:2:0,PHYS1040:1:2:0,PHYS1041:1:2:0,AEMA1113:1:2:0,AEMA1213:1:2:0,AEMA1312:1:2:0,AEMA1303:1:2:0,AEPC1203:1:3:0,COMM1020:1:3:0,EFFL1003:1:3:0,AEMA1332:2:1:0,AEMA2131:2:1:0,AEMA2231:2:1:0,AEMA2341:2:1:0,AEMA2121:2:1:0,AEMA2221:2:1:0,MATH3010:2:1:0,AEMA2133:2:2:0,AEMA2201:2:2:0,AEMA2222:2:2:0,AETN2302:2:2:0,MATH3020:2:2:0,AEMA3121:2:2:0,AEMA3221:2:2:0,AEMA2142:2:2:0,AEMA2242:2:2:0,AECH1100:2:3:0,MATH3030:2:3:0,BIOL1001:2:3:1,BIOL1002:2:3:1,BIOL1003:2:3:1,EASC1001:2:3:1,PHYS2001:2:3:1,CHEM3050:2:3:1,AEMA2333:3:1:0,AEMA2112:3:1:0,AEMA2232:3:1:0,AEMA3302:3:1:0,AEMA2103:3:1:0,AEMA2203:3:1:0,AEMA4312:3:1:0,AEMA4142:3:2:0,AEMA3341:3:2:0,AEMA3331:3:2:0,AEMA3342:3:2:0,AEMA3133:3:2:0,AECH2112:3:2:2,ECON1001:3:2:2,GARC1001:3:2:2,GARC2001:3:2:2,GARC2002:3:2:2,GARC2003:3:2:2,GARC2004:3:2:2,AEMA3000:3:3:0,AEMA4100:4:1:0,AEMA4301:4:1:0,COMM3010:4:1:0,AEMA4112:4:1:0,AEMA3200:4:1:0,AEMA4341:4:1:3,AEMA4343:4:1:3,AEMA4344:4:1:3,AEMA4302:4:2:0,AEMA4132:4:2:0,AEMA4232:4:2:0,AEMA3351:4:2:3,AERO3344:4:2:3,AEMA4345:4:2:3
medical-radiography|health-sciences|Bachelor of Science in Medical Imaging|B.Sc. MI|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-medical-imaging-bsc-mi|2026-2027||BIOL1110:1:1:0,BIOL1111:1:1:0,COMM1010:1:1:0,HSHG2080:1:1:0,HSMI1110:1:1:0,HSMI1120:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,COMM1020:1:2:0,HSMI1210:1:2:0,HSMI1220:1:2:0,BIOL1310:1:3:0,HSMI1310:1:3:0,HSMI2110:2:1:0,HSMI2120:2:1:0,HSMI2130:2:1:0,MATH2002:2:1:0,HSMI2210:2:2:0,HSMI2220:2:2:0,HSMI2230:2:2:0,HSMI2240:2:2:0,HSMI2250:2:2:0,HSMI2310:2:3:0,HSMI2320:2:3:0,HSMI2330:2:3:0,HSMI3120:3:1:0,HSMI3130:3:1:0,HSMI3140:3:1:0,HSMI3150:3:1:0,HSMI3210:3:2:0,HSMI3220:3:2:0,HSMI3230:3:2:0,HSMI3240:3:2:0,HSMI3310:3:3:0,HSMI3320:3:3:0,HSMI4110:4:1:0,HSMI4120:4:1:0,HSHG4101:4:1:0,HSMI4210:4:2:0
midwifery|health-sciences|Bachelor of Science in Midwifery|B.Sc. Mw|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-midwifery-bsc-mw|2026-2027|General Education Requirement: select 1 of 16|BIOL1030:1:1:0,BIOL1031:1:1:0,COMM1010:1:1:0,MIDW1010:1:1:0,NURS1040:1:1:0,MIDW1210:1:2:0,MIDW1220:1:2:0,MIDW1230:1:2:0,RSST1001:1:2:0,MIDW1310:1:3:0,MIDW1320:1:3:0,MATH2002:2:1:0,NURS1010:2:1:0,MIDW2030:2:1:0,MIDW2040:2:1:0,MIDW2041:2:1:0,MIDW2042:2:1:0,MIDW2210:2:2:0,MIDW2211:2:2:0,MIDW2220:2:2:0,MIDW2221:2:2:0,MIDW2240:2:2:0,MIDW2340:2:3:0,HSHG2101:2:3:0,MIDW3010:3:1:0,MIDW3020:3:1:0,MIDW3040:3:1:0,BUSG2001:3:1:1,ECON1001:3:1:1,GARC1001:3:1:1,GARC2001:3:1:1,GARC2002:3:1:1,GARC2003:3:1:1,GARC2004:3:1:1,HSHG2080:3:1:1,SSHA1001:3:1:1,SSHA1002:3:1:1,SSHA1003:3:1:1,SSHA1004:3:1:1,SSHA1005:3:1:1,SSHA1006:3:1:1,SSHA1007:3:1:1,SSHA2001:3:1:1,MIDW3210:3:2:0,MIDW3240:3:2:0,MIDW3340:3:3:0,MIDW4040:4:1:0,MIDW4240:4:2:0
nursing|health-sciences|Bachelor of Science in Nursing|B.Sc. N|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-nursing-bsc-n|2026-2027|General Education Requirement: select 1 of 16|COMM1010:1:1:0,BIOL1030:1:1:0,BIOL1031:1:1:0,BIOL1110:1:1:0,BIOL1111:1:1:0,NURS1101:1:1:0,NURS1040:1:1:0,RSST1001:1:2:0,BIOL1210:1:2:0,BIOL1211:1:2:0,NURS1010:1:2:0,NURS1020:1:2:0,NURS1030:1:2:0,NURS1021:1:3:0,NURS1050:1:3:0,NURS2020:2:1:0,NURS2101:2:1:0,NURS2102:2:1:0,NURS2103:2:1:0,NURS2401:2:1:0,NURS2021:2:2:0,HSHG2101:2:2:0,NURS2010:2:2:0,NURS2491:2:2:0,MATH2002:2:3:0,NURS2492:2:3:0,NURS3101:3:1:0,NURS3102:3:1:0,NURS3401:3:1:0,NURS4104:3:1:0,NURS3402:3:2:0,NURS4101:3:2:0,HSHG2080:3:2:1,MIDW1230:3:2:1,ECON1001:3:2:1,GARC1001:3:2:1,GARC2001:3:2:1,GARC2002:3:2:1,GARC2003:3:2:1,GARC2004:3:2:1,SSHA1001:3:2:1,SSHA1002:3:2:1,SSHA1003:3:2:1,SSHA1004:3:2:1,SSHA1005:3:2:1,SSHA1006:3:2:1,SSHA1007:3:2:1,BUSG2001:3:2:1,NURS3403:3:3:0,NURS4102:4:1:0,NURS4103:4:1:0,NURS4401:4:1:0,NURS4402:4:2:0
occupational-health-safety-environment|health-sciences|Bachelor of Science in Occupational Health, Safety and Environment|B.Sc. OHSE|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-occupational-health|2026-2027|General Education Requirement: select 1 of 6~General Education Requirement: select 0 of 8|BIOL1110:1:1:0,BIOL1111:1:1:0,COMM1010:1:1:0,PHYS1050:1:1:0,HSOH1100:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,CHEM1050:1:2:0,CHEM1051:1:2:0,HSOH1200:1:2:0,HSOH1300:1:3:0,HSOH2040:1:3:0,SSHA1003:1:3:0,AECH1103:2:1:0,BIOL2010:2:1:0,BIOL2011:2:1:0,HSOH2110:2:1:0,COMM1020:2:1:0,BUSG2002:2:2:0,HSOH2102:2:2:0,HSOH2220:2:2:0,MATH2002:2:2:0,HSOH2050:2:3:0,HSOH2300:2:3:0,RSST1001:2:3:0,HSOH3110:3:1:0,HSOH3220:3:1:0,HSOH3150:3:1:0,ECON1001:3:1:1,GARC1001:3:1:1,GARC2001:3:1:1,GARC2002:3:1:1,GARC2003:3:1:1,GARC2004:3:1:1,HSOH3210:3:2:0,HSOH3120:3:2:0,HSOH3251:3:2:0,SSHA1001:3:2:1,SSHA1002:3:2:1,SSHA1004:3:2:1,SSHA1005:3:2:1,SSHA1006:3:2:1,SSHA1007:3:2:1,HSOH3300:3:3:0,MGMT2010:3:3:0,HSOH4100:4:1:0,HSOH4130:4:1:0,BUSG2001:4:1:2,HSEH1110:4:1:2,SCIE1002:4:1:2,HSOH4200:4:2:0
paramedicine|health-sciences|Bachelor of Science in Paramedicine|B.Sc. P|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-paramedicine-bsc-p|2026-2027|General Education Requirement: select 1 of 6|BIOL1030:1:1:0,BIOL1031:1:1:0,BIOL1110:1:1:0,BIOL1111:1:1:0,CHEM1050:1:1:0,HSPA1000:1:1:0,COMM1010:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,HSHG2080:1:2:0,HSHG2090:1:2:0,PHYS1050:1:2:0,RSST1001:1:2:0,BIOL1310:1:3:0,HSHG2210:1:3:0,HSPA2100:2:1:0,HSPA2101:2:1:0,HSPA2111:2:1:0,HSPA2150:2:1:0,HSPA2360:2:1:0,HSPA2202:2:2:0,HSPA2212:2:2:0,HSPA2241:2:2:0,HSPA3165:2:2:0,MATH2002:2:2:0,HSPA2303:2:3:0,HSPA2313:2:3:0,HSPA2375:2:3:0,HSPA3221:3:1:0,HSPA3231:3:1:0,HSPA3242:3:1:0,HSPA3280:3:1:0,HSPA3370:3:1:0,HSPA3341:3:2:0,HSPA4122:3:3:0,HSPA4132:3:3:0,HSPA4223:4:1:0,HSPA4233:4:1:0,HSPA4285:4:1:0,ECON1001:4:1:1,GARC1001:4:1:1,GARC2001:4:1:1,GARC2002:4:1:1,GARC2003:4:1:1,GARC2004:4:1:1,HSPA4342:4:2:0
pharmacy-technology|health-sciences|Bachelor of Science in Pharmacy Technology|B.Sc. PT|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-pharmacy-technology-bsc|2026-2027|General Education Requirement: select 1 of 6|BIOL1110:1:1:0,BIOL1111:1:1:0,CHEM1050:1:1:0,CHEM1051:1:1:0,COMM1010:1:1:0,HSPT1301:1:1:0,HSPT1101:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,COMM1020:1:2:0,HSPT1201:1:2:0,HSHG2080:1:2:0,HSPT1202:1:2:0,BIOL1310:1:3:0,HSPT1203:1:3:0,RSST1001:1:3:0,HSPT2101:2:1:0,HSPT2102:2:1:0,HSPT2103:2:1:0,MATH2002:2:1:0,HSPT2104:2:2:0,HSPT2201:2:2:0,HSPT2202:2:2:0,HSPT2203:2:2:0,HSPT2204:2:2:0,HSPT2300:2:3:0,HSPT2100:3:1:0,HSPT3101:3:1:0,BIOL2010:3:1:0,BIOL2011:3:1:0,SSHA1002:3:1:0,HSPT3201:3:2:0,HSPT3202:3:2:0,HSPT3203:3:2:0,HSPT3204:3:2:0,SSHA1003:3:3:0,ECON1001:3:3:1,GARC1001:3:3:1,GARC2001:3:3:1,GARC2002:3:3:1,GARC2003:3:3:1,GARC2004:3:3:1,HSPT4101:4:1:0,HSPT4102:4:1:0,HSPT4103:4:1:0,HSPT4104:4:1:0,HSPT4105:4:1:0,HSPT4200:4:2:0
respiratory-therapy|health-sciences|Bachelor of Science in Respiratory Therapy|B.Sc. RT|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/bachelor-science-respiratory-therapy-bsc|2026-2027|General Education Requirement: select 1 of 6|BIOL1030:1:1:0,BIOL1031:1:1:0,BIOL1110:1:1:0,BIOL1111:1:1:0,CHEM1050:1:1:0,PHYS1050:1:1:0,COMM1010:1:1:0,BIOL1210:1:2:0,BIOL1211:1:2:0,COMM1020:1:2:0,HSHG2080:1:2:0,HSRT1000:1:2:0,RSST1001:1:2:0,BIOL1310:1:3:0,HSRT1100:1:3:0,HSHG2210:2:1:0,HSRT2120:2:1:0,HSRT2200:2:1:0,HSRT2210:2:1:0,HSRT2220:2:1:0,HSRT2300:2:2:0,HSRT2310:2:2:0,HSRT2320:2:2:0,MATH2002:2:2:0,ECON1001:2:2:1,GARC1001:2:2:1,GARC2001:2:2:1,GARC2002:2:2:1,GARC2003:2:2:1,GARC2004:2:2:1,HSRT2330:2:3:0,HSRT2340:2:3:0,HSRT3120:3:1:0,HSRT3130:3:1:0,HSRT3140:3:1:0,HSRT3200:3:1:0,HSRT3240:3:1:0,HSRT3000:3:2:0,HSRT3210:3:2:0,HSRT3230:3:2:0,HSRT3300:3:2:0,HSRT3310:3:2:0,HSRT3330:3:3:0,HSRT4200:4:1:0,HSRT4300:4:2:0
software-engineering|computing-and-it|Bachelor of Science in Software Engineering|B.Sc. SE|https://www.udst.edu.qa/bachelor-science-software-engineering-bsc-se|2026-2027|General Education Requirement: select 1 of 3~General Education Requirement: select 1 of 8~General Education Requirement: select 2 of 6~Elective: select 1 of 2|COMM1010:1:1:0,INFS1101:1:1:0,MATH1030:1:1:0,PHYS1020:1:1:0,PHYS1021:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,INFS1201:1:2:0,INFT2101:1:2:0,MATH1050:1:2:0,SCIE1001:1:2:1,SCIE1002:1:2:1,BIOL1070:1:2:1,INFS1301:1:3:0,MATH2010:1:3:0,BIOL1001:2:1:0,DACS2101:2:1:0,INFS2201:2:1:0,INFS3102:2:1:0,INFS2101:2:1:0,DACS2201:2:2:0,INFS3103:2:2:0,INFS3104:2:2:0,MATH2020:2:2:0,SOFT2101:2:2:0,SOFT2301:2:3:0,SSHA1001:2:3:2,SSHA1002:2:3:2,SSHA1003:2:3:2,SSHA1004:2:3:2,SSHA1005:2:3:2,SSHA1006:2:3:2,SSHA1007:2:3:2,SSHA2001:2:3:2,DSAI2201:3:1:0,INFS3201:3:1:0,INFT2201:3:1:0,RSST3002:3:1:0,INFS3203:3:2:0,SOFT3201:3:2:0,SOFT3202:3:2:0,ECON1001:3:2:3,GARC1001:3:2:3,GARC2001:3:2:3,GARC2002:3:2:3,GARC2003:3:2:3,GARC2004:3:2:3,COMP3301:3:3:0,COMP4101:4:1:0,INFS4202:4:1:0,SOFT4102:4:1:0,SOFT4103:4:1:0,COMP4201:4:2:0,DACS3203:4:2:0,INFS4101:4:2:0,INFS4104:4:2:4,SOFT4101:4:2:4,COMP4302:4:3:0
teaching-stem|general-education|Bachelor of Science in Teaching STEM|B.Sc. TS|https://www.udst.edu.qa/academic/our-colleges/college-general-education/bachelor-science-teaching-stem-bsc-ts|2026-2027||COMM1010:1:1:0,EDUC1010:1:1:0,MATH1030:1:1:0,CHEM1010:1:1:0,CHEM1011:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,SSHA1003:1:2:0,MATH2010:1:2:0,PHYS1020:1:2:0,PHYS1021:1:2:0,EDUC1080:1:2:0,SSHA1004:1:3:0,SSHA1006:1:3:0,MATH1040:2:1:0,BIOL1001:2:1:0,EDUC2010:2:1:0,EDUC2030:2:1:0,INFS1101:2:1:0,GARC2001:2:2:0,PHYS1040:2:2:0,PHYS1041:2:2:0,EDUC2020:2:2:0,AEEL1101:2:2:0,AEEL1201:2:2:0,INFS1201:2:2:0,EDPR2010:2:3:0,RSST3001:3:1:0,EDUC3030:3:1:0,EDUC3050:3:1:0,EDUC3020:3:2:0,EDUC3040:3:2:0,EDUC3060:3:2:0,EDPR3010:3:3:0,EDPR4010:4:1:0,GARC2002:4:2:0
data-cyber-security|computing-and-it|Bachelor of Science in Data and Cyber Security|B.Sc. DCS|https://www.udst.edu.qa/academic/our-colleges/college-computing-and-information-technology/bachelor-science|2026-2027|General Education Requirement: select 1 of 3~General Education Requirement: select 1 of 6~Elective: select 1 of 9|COMM1010:1:1:0,INFS1101:1:1:0,MATH1030:1:1:0,EFFL1003:1:1:0,COMM1020:1:2:0,INFS1201:1:2:0,INFT2101:1:2:0,MATH1040:1:2:0,INFS1301:1:3:0,SCIE1001:1:3:1,SCIE1002:1:3:1,BIOL1070:1:3:1,INFS2101:2:1:0,DACS2201:2:1:0,DACS2101:2:1:0,MATH1050:2:1:0,DACS2202:2:2:0,DSAI2201:2:2:0,INFS2201:2:2:0,INFT3102:2:2:0,SOFT2301:2:3:0,ECON1001:2:3:2,GARC1001:2:3:2,GARC2001:2:3:2,GARC2002:2:3:2,GARC2003:2:3:2,GARC2004:2:3:2,DACS3101:3:1:0,INFT3101:3:1:0,INFT2201:3:1:0,DACS3203:3:1:0,DACS3201:3:2:0,DACS4101:3:2:0,DACS3202:3:2:0,INFS3201:3:2:0,DACS3301:3:3:0,COMP4101:4:1:0,DACS4103:4:1:0,DACS4202:4:1:0,DACS4102:4:1:3,DACS4210:4:1:3,DACS4105:4:1:3,DACS4208:4:1:3,DACS4203:4:1:3,DACS4204:4:1:3,DACS4205:4:1:3,INFT4208:4:1:3,DACS4110:4:1:3,COMP4201:4:2:0,DACS4206:4:2:0,COMP4301:4:3:0
midwifery-post-diploma|health-sciences|Post-Diploma Bachelor of Science in Midwifery|PDip. B.Sc. Mw|https://www.udst.edu.qa/post-diploma-bachelor-science-midwifery-pdip-bsc-mw|2026-2027|Elective: select 1 of 2|NUMW1230:1:1:0,NUMW2020:1:1:0,NUMW3110:1:1:0,NUMW3120:1:1:0,RSST1001:1:1:0,NUMW3130:1:1:1,NUMW3150:1:1:1,MATH2002:1:2:0,NUMW2030:1:2:0,NUMW3220:1:2:0,NUMW3230:1:2:0,NUMW3250:1:2:0,NUMW3020:1:3:0,NUMW3210:1:3:0,NUMW3350:1:3:0,NUMW4150:2:1:0,NUMW4250:2:2:0,NUMW4350:2:3:0
nursing-post-diploma|health-sciences|Post-Diploma Bachelor of Science in Nursing|PDip. B.Sc. N|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/post-diploma-bachelor-science-nursing|2026-2027|Elective: select 2 of 14|NURS3104:1:1:0,RSST1001:1:1:0,HSHG2101:1:1:0,NURS3391:1:1:0,NURS4102:1:1:0,NURS2104:1:2:0,NURS3392:1:2:0,HSHG2080:1:2:1,NUMW1230:1:2:1,GARC1001:1:2:1,GARC2001:1:2:1,GARC2002:1:2:1,ECON1001:1:2:1,SSHA1001:1:2:1,SSHA1002:1:2:1,SSHA1003:1:2:1,SSHA1004:1:2:1,SSHA1005:1:2:1,SSHA1006:1:2:1,SSHA2001:1:2:1,BUSG2001:1:2:1,MATH2002:1:3:0,NURS3404:1:3:0,NURS4403:2:1:0,NURS4101:2:1:0,NURS4105:2:1:0,NURS4103:2:2:0,NURS4106:2:2:0,NURS4404:2:2:0,NURS4405:2:3:0
nursing-post-practical|health-sciences|Post-Practical Nursing Bachelor of Science in Nursing|PPN B.Sc. N|https://www.udst.edu.qa/academic/our-colleges/college-health-sciences/post-practical-nursing-bachelor-science|2026-2027|Elective: select 1 of 14|NURS3101:1:1:0,NURS3102:1:1:0,NURS3103:1:1:0,NURS3405:1:1:0,RSST1001:1:2:0,HSHG2101:1:2:0,NURS3406:1:2:0,NURS4102:1:2:0,MATH2002:1:3:0,NURS3407:1:3:0,HSHG2080:1:3:1,NUMW1230:1:3:1,ECON1001:1:3:1,GARC1001:1:3:1,GARC2001:1:3:1,GARC2002:1:3:1,SSHA1001:1:3:1,SSHA1002:1:3:1,SSHA1003:1:3:1,SSHA1004:1:3:1,SSHA1005:1:3:1,SSHA1006:1:3:1,SSHA2001:1:3:1,BUSG2001:1:3:1,NURS4104:2:1:0,NURS4101:2:1:0,NURS4407:2:1:0,NURS4103:2:2:0,NURS4408:2:2:0,NURS4409:2:3:0
$p$, '\n') as l
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
