from pathlib import Path

country_shapes = {}

with open(Path(__file__).parents[0] / "countries.geojson", "r") as file:
    content = file.read()

json = eval(content)
print(json["features"][0]["type"])

counter = 0
for feature in json["features"]:
    counter += 1

    shape = feature["geometry"]["coordinates"]
    country = feature["properties"]["ADMIN"] 

    country_shapes[country] = shape

    if counter >= 2:
        break

with open(Path(__file__).parents[0] / "country_shapes.txt", "w") as file:
    file.write(str(country_shapes))

print(country_shapes)