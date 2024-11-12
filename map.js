
// Initialize map with custom setup
function initializeMap() {
    var map = L.map('map').setView([9.145, 40.489673], 7);

    // Base Layers
    var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    var baseMaps = {
        "OpenStreetMap": osmLayer,
        "Satellite": googleSat,
        "Streets": googleStreets
    };

    // Layer Controls
    var overlays = setupOverlays(map);
    L.control.layers(baseMaps, overlays, { collapsed: true }).addTo(map);

    // Geocoder for Searching
    L.Control.geocoder().addTo(map);

    return map;
}

// Function to set up overlays with improved accessibility
function setupOverlays(map) {
    var refAirport = createAirportMarkers();
    var refAFCP = createAFCPMarkers();
    var amSpaces = createAmericanSpaces();

    refAirport.addTo(map); // Enable default layer visibility
    return {
        "Airports": refAirport,
        "Amb Fund Cult Pres": refAFCP,
        "American Spaces": amSpaces
    };
}

// Error-handling Fetch for GeoJSON data
function loadGeoJsonData(url, onEachFeature) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => L.geoJSON(data, { onEachFeature }).addTo(map))
        .catch(error => console.error('Error loading GeoJSON:', error));
}

// Example function for loading airports with accessible popups
function createAirportMarkers() {
    var refAirport = L.layerGroup();
    const airportIcon = L.icon({
        iconUrl: 'https://api.geoapify.com/v1/icon/?type=awesome&scaleFactor=1&color=%2372a2d4&size=small&icon=plane-departure',
        cursor: 'pointer'
    });

    // Define airport markers here
    var mHAAB = L.marker([8.97789, 38.799301], { icon: airportIcon })
                 .bindPopup('<p aria-label="Airport: Bole Airport">HAAB<br/>Bole Airport</p>').addTo(refAirport);

    return refAirport;
}

// Initialize map on page load
document.addEventListener("DOMContentLoaded", () => {
    initializeMap();
});
