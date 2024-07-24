'''
TEMPORARY FILE! Only for migration from display names to ISO_A3 
This script generates a file which contains the display names to the ISO_A3 chars
'''

from pathlib import Path

with open(Path(__file__).parents[0] / "../geojson_conversion/countries.geojson", "r") as file:
    content = file.read()
    geo_json = eval(content)

with open(Path(__file__).parents[0] / "../flagData.js", "r") as file:
    content = file.read()
    flag_data = eval(content[15:-1])

feature_names = {}
for feature in geo_json["features"]:
    country_name = feature["properties"]["ADMIN"] 
    country_iso = feature["properties"]["ISO_A3"] 
    feature_names[country_name] = country_iso

display_names = {}
for name in flag_data:
    if name in feature_names.keys():
        iso = feature_names[name]
        display_names[iso] = name
    else:
        iso = input(f"ISO_A3 for {name}: ")
        if iso == "WRITE":
            with open(Path(__file__).parents[0] / "out.txt", "w") as file:
                file.write(f"{display_names}")
            break
        display_names[iso] = name

print(display_names)
with open(Path(__file__).parents[0] / "out.txt", "w") as file:
    file.write(f"{display_names}")


print("Done")