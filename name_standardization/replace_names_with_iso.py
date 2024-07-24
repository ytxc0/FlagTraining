'''
TEMPORARY FILE! Only for migration from display names to ISO_A3 
This script converts .stats files from the previous display name format to the current ISO_A3 format
'''

from pathlib import Path

with open(Path(__file__).parents[0] / "../displayNames.js", "r") as file:
    content = file.read()[19:-1]
    display_names = eval(content)

with open(Path(__file__).parents[0] / "flag.stats", "r") as file:
    content = file.read()
    iteration = eval(content)["iteration"]
    stats = eval(content)["flagStats"]

with open(Path(__file__).parents[0] / "../flagData.js", "r") as file:
    content = file.read()[15:-1]
    flag_data = eval(content)



def get_iso_from_name(name: str):
    for iso in display_names.keys():
        if display_names[iso] == name:
            return iso
    print(f"Could not found an iso for {name}.")



new_stats = {}
for name in stats.keys():
    iso = get_iso_from_name(name)
    new_stats[iso] = stats[name]

with open(Path(__file__).parents[0] / "new.stats", "w") as file:
    file.write(f"{{'iteration': {iteration}, 'flagStats': {new_stats}}}".replace("'", '"'))


new_flag_data = {}
for name in flag_data.keys():
    iso = get_iso_from_name(name)
    new_flag_data[iso] = flag_data[name]

with open(Path(__file__).parents[0] / "newFlagData.js", "w") as file:
    file.write(f"let flagData = {new_flag_data};".replace("'", '"'))



print("Done")