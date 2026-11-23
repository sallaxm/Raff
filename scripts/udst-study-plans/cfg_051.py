# Config for migration 051 (diplomas, advanced diplomas, master's)
import re
WITH_LEVEL = True
KEEP_NAMES = True  # don't overwrite course titles already set by the bachelor plans
def LEVEL(title):
    t = title.lower()
    if t.startswith("advanced diploma"): return "advanced-diploma"
    if t.startswith("diploma"): return "diploma"
    if t.startswith("master"): return "master"
    return "bachelor"
B, H, E, C, G = "business", "health-sciences", "engineering-and-technology", "computing-and-it", "general-education"
MAP = {
 "advanced-diploma-automation": (E, "adv-dip-automation-control"),
 "advanced-diploma-chemical-and": (E, "adv-dip-chemical-processing"),
 "advanced-diploma-construction": (E, "adv-dip-construction"),
 "advanced-diploma-electrical": (E, "adv-dip-electrical-power-renewable"),
 "advanced-diploma-maintenance": (E, "adv-dip-mechanical-maintenance"),
 "advanced-diploma": (E, "adv-dip-telecom-network"),
 "diploma-accounting-dip-acc": (B, "dip-accounting"),
 "diploma-animal-health-veterinary-sciences-dipahvs": (H, "dip-animal-health-veterinary-sciences"),
 "diploma-automation-and": (E, "dip-automation-control"),
 "diploma-chemical-and": (E, "dip-chemical-processing"),
 "diploma-construction": (E, "dip-construction"),
 "diploma-healthcare-management-dip-hcm": (B, "dip-healthcare-management"),
 "diploma-human-resource-management-dip-hrm": (B, "dip-human-resource-management"),
 "diploma-information-0": (C, "dip-information-technology"),
 "diploma-information": (C, "dip-information-systems"),
 "diploma-marketing-dip-mktg": (B, "dip-marketing"),
 "diploma-pharmacy-technology-dip-pt": (H, "dip-pharmacy-technology"),
 "diploma-practical-nursing-dip-pn": (H, "dip-practical-nursing"),
 "master-science-0": (H, "msc-midwifery"),
 "master-science-accounting-and-finance-msc": (B, "msc-accounting-finance"),
 "master-science-critical-care": (H, "msc-critical-care"),
 "master-science-data-science-and-artificial-intelligence-msc-dsai": (C, "msc-data-science-ai"),
 "master-science-diabetes-care-and-patient": (H, "msc-diabetes-care-patient-education"),
 "master-science-digital-marketing-and-entrepreneurship-msc-dme": (B, "msc-digital-marketing-entrepreneurship"),
 "master-science-human-resource-management-msc": (B, "msc-human-resource-management"),
 "master-science-process-safety": (E, "msc-process-safety"),
 "master-science-stem-and-tvet-education": (G, "msc-stem-tvet-education"),
 "master-science-teaching-stem-msc-ts": (G, "msc-teaching-stem"),
 "master-science": (C, "msc-ai-cognitive-cybersecurity"),
}
SHORT_OVERRIDE = {"master-science-0": "M.Sc. Mw"}
