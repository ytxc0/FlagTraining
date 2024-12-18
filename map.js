let clickedCountryLayer;

// Create map
let map = L.map('map', { worldCopyJump: true }).setView([26.75, 14.25], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Add clickable countries to map
let geojson = L.geoJson(countriesGeoJson, {
    style: {
        fillColor: "#8884",
        weight: 1,
        opacity: 1,
        color: "#0000",
        dashArray: '3',
        fillOpacity: 0.75
    },
    onEachFeature: handleFeatureClick
}).addTo(map);

// Create marker
let marker = L.marker([0, 0]);

// Map click event
map.on('click', (e) =>
{
    map.addLayer(marker);
    marker.setLatLng(e.latlng);
});


/**
 * Applies 'selected' style to the given layer
 * @param {layer} layer layer to be styled
 */
function highlightSelectedFeature(layer)
{
    layer.setStyle({
        fillColor: "#1F77BA",
        weight: 1,
        color: '#004884',
        dashArray: '',
        fillOpacity: 0.75
    });

    layer.bringToFront();
}

/**
 * Highlights the correct country on the map
 */
function highlightCorrectCountry()
{
    Object.keys(map._layers).forEach(layerNumber =>
    {
        let layer = map._layers[layerNumber];
        if (layer instanceof L.Path)
        {
            let iso = layer.feature.properties.ISO_A3;
            if (iso == currentFlag || iso == adminCountries[currentFlag])
            {
                layer.setStyle({
                    fillColor: "#2a2",
                    weight: 1,
                    color: "#070",
                    dashArray: '',
                    fillOpacity: 0.75
                });
                layer.bringToFront();

                map.fitBounds(layer._latlngs);
            }
        }
    });
}

/**
 * Highlights the country the user clicked as wrong if it is
 */
function highlightWrongCountry()
{
    clickedCountryLayer.setStyle({
        fillColor: "#C52124",
        weight: 1,
        color: '#7F2518',
        dashArray: '',
        fillOpacity: 0.7
    });

    clickedCountryLayer.bringToFront();
}

/**
 * Resets the map view
 */
function resetMap()
{
    geojson.resetStyle();
    map.removeLayer(marker);
    map.setView([26.75, 14.25], 2);

    document.querySelector(".map-container").classList.remove("guess-correct");
    document.querySelector(".map-container").classList.remove("guess-wrong");
}

/**
 * Saves the clicked country and highlights it
 * @param {_} feature 
 * @param {layer} layer 
 */
function handleFeatureClick(feature, layer)
{
    layer.on({
        click: (e) =>
        {
            geojson.resetStyle();

            clickedCountryLayer = e.target;
            highlightSelectedFeature(clickedCountryLayer);
        }
    });
}