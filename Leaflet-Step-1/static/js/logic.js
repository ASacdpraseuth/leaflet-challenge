var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'

d3.json(url).then(createFeatures);


// create tile
var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //id: "mapbox/streets-v11",
    id: 'mapbox/light-v9',
    //attribution: ...,
    accessToken: API_KEY,
    tileSize: 512,
    zoomOffset: -1
});

// pick colors based on magnitude
// USGS uses moment magnitude scale which has no upper bound however going up to 9 should be more than enough
function colorPicker(mag) {
    return mag > 9 ? '#bd0026' :
        mag > 7 ? '#f03b20' :
        mag > 5 ? '#fd8d3c' :
        mag > 3 ? '#feb24c' :
        mag > 1 ? '#fed976' :
        '#ffffb2';
};

// make features
function createFeatures(allMonthData) {
    
    // Make popups for each feature
    function onEach(feature, layer) {
        layer.bindPopup('<h3> Location: ' 
            + feature.properties.place 
            + '</h3><hr><p>' 
            + new Date(feature.properties.time)
            + '</p>'
            + '<br><h2> Magnitude: '
            + feature.properties.mag
            + '</h2');
    }

    // make features array
    function makeCircles(feature, latlng) {
        let options = {
            radius: feature.properties.mag,
            fillColor: colorPicker(feature.properties.mag),
            color: colorPicker(feature.properties.mag),
            weight: 1,
            opacity: .75,
            fillOpacity: .25
        }

        return L.circleMarker(latlng, options);
    }

    var quakes = L.geoJSON(allMonthData, {
        onEachFeature: onEach,
        pointToLayer: makeCircles
    });

    // mapping it out
    //createMap(quakes);

    var baseMaps = {
        'light-v9': light
    };
    
    var overlayMaps = {
        'Earthquakes': quakes
    };

    var myMap = L.map('map', {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [light, quakes]
    });

    // add layer controller and stuff to map

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // legendary
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 3, 5, 7, 9],
            labels = [];
        
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:'
                + colorPicker(grades[i] + 1)
                + '"></i> '
                + grades[i]
                + (grades[i + 1] ? '&ndash;'
                + grades[i + 1]
                + '<br>' : '+');
        }

        return div;
        };

        legend.addTo(myMap);

};