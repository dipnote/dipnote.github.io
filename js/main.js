// API Keys
const YOUR_API_KEY = "72988d9175074bdcbc8fe8ce0005452a"; // For Geoapify icons
const ACLED_API_KEY = "ujtQHEeGFTEfGG3BIBGS"; // For ACLED data

// Initialize the map
var map = L.map('map').setView([9.15, 40.49], 7); // Coordinates for Ethiopia

// Set up the OpenStreetMap tile layer
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

///////////   Admin LAYERS

// Layer group for the GeoJSON data (ET-Admin3-2023)
var refGeoJSON = L.layerGroup();
// New GeoJSON layer for Regions (ET_admin1_2023)
var refRegion = L.layerGroup();
// Create a new layer for LAT-LNG-MGRS markers
var refLATLNGMGRS = L.layerGroup();

// Add default layers to the map if needed
// enable to pre-select Woredas
// refGeoJSON.addTo(map); // Add Woredas by default

// Generic function to load GeoJSON point layers
function loadGeoJsonPointLayer(layerGroup, geoJsonUrl, icon, popupContentFunction) {
    fetch(geoJsonUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok for ${geoJsonUrl}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
                    return L.marker([latlng.lat, latlng.lng], { icon: icon });
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                        const popupHtml = popupContentFunction(feature.properties);
                        if (popupHtml) {
                            layer.bindPopup(popupHtml);
                        }
                    }
                }
            }).addTo(layerGroup);
        })
        .catch(error => console.error(`Error loading GeoJSON from ${geoJsonUrl}:`, error));
}


// Function to load GeoJSON dynamically (for polygons/lines, not points with icons)
function loadGeoJSON(layer, url, layerType) {
    // Clear the layer before adding new data
    layer.clearLayers();

    // Fetch the new GeoJSON data from the given URL
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Add the fetched GeoJSON data to the given layer
            L.geoJSON(data, {
                style: function (feature) {
                    // Use the layerType to determine the color of the line
                    if (layerType === 'Regions') {
                        return {
                            color: "green",  // Set line color to green for 'Regions'
                            weight: 1.0,
                            opacity: 0.5,
                            fillColor: "#a1e3a1",
                            fillOpacity: 0.1
                        };
                    } else {
                        return {
                            color: "purple",  // Default color for other layers
                            weight: 0.8,
                            opacity: 0.25,
                            fillColor: "#e2fdff",
                            fillOpacity: 0.1
                        };
                    }
                },
                onEachFeature: function (feature, layer) {
                    // Consolidate popup logic
                    if (feature.properties) {
                        let popupContent = '';

                        // Check available properties and construct popup content accordingly
                        if (feature.properties.name) {
                            popupContent += `<b>${feature.properties.name}</b><br/>`;
                        }
                        if (feature.properties.admin_2) {
                            popupContent += `${feature.properties.admin_2}<br/>`;
                        }
                        if (feature.properties.admin_1) {
                            popupContent += `${feature.properties.admin_1}<br/>`;
                        }
                        if (feature.properties.id) {
                            popupContent += `ID: ${feature.properties.id}<br/>`;
                        }
                        if (feature.properties.ADMIN1) {
                            popupContent += `Region: ${feature.properties.ADMIN1}`;
                        }

                        // Add mouseover and mouseout event handlers to the layer
                        if (popupContent) {
                            layer.on('mouseover', function () {
                                layer.bindPopup(popupContent).openPopup();
                            });
                            layer.on('mouseout', function () {
                                layer.closePopup();
                            });
                        }
                    }
                }
            }).addTo(layer);
        })
        .catch(error => {
            console.error('Error loading the GeoJSON:', error);
        });
}

//////////// END Admin LAYERS

// Fetch the GeoJSON file
fetch('data/conflict/241207-22JUL14-24NOV30-Incident-Cleaned.geojson')
    .then(response => response.json())
    .then(data => {
        // Store the GeoJSON data for future use
        var allIncidents = data.features;

        // Function to filter incidents by date range
        function filterIncidents(startDate, endDate) {
            var filtered = allIncidents.filter(function (feature) {
                var incidentDate = new Date(feature.properties.IncidentDate);
                return incidentDate >= startDate && incidentDate <= endDate;
            });
            return filtered;
        }

        // Layer groups for each date range with marker clusters
        // Removed: var last30Layer, var last31to60Layer, var last61to90Layer

        // Function to create markers for each filtered incident and add them to the respective clusters
        function createMarkerLayer(layer, incidents, color) {
            incidents.forEach(function (feature) {
                var latlng = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
                var marker = L.circleMarker(latlng, {
                    radius: 8,
                    color: color,
                    weight: 2,
                    fillOpacity: 0.25
                });

                // Add popup to marker
                marker.bindPopup("<b>Date:</b> " + feature.properties.IncidentDate + "<br>" +
                    "<b>Type:</b> " + feature.properties.IncidentType + "<br>" +
                    "<b>Description:</b> " + feature.properties.Description);
                layer.addLayer(marker);
            });
        }

        // Create markers for each date range with specific colors
        // Removed calls to createMarkerLayer for last30Layer, last31to60Layer, last61to90Layer

        // Activate the main incident layer
        var refAllIncidents = L.markerClusterGroup();
        createMarkerLayer(refAllIncidents, allIncidents, 'orange');


        // **** BASE LAYERS *****
        googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        });

        // Public Universities GeoJSON
        let refUnivPublic = L.layerGroup();
        L.geoJSON(geoJSON_pub_univ_data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, { radius: 10, color: 'purple', weight: 2, fill: true }).bindPopup(feature.properties.name + '</br> Generation: ' + feature.properties.gen + '</br> Category: ' + feature.properties.category + '</br><a href="http://' + feature.properties.link + '" target="_blank">Website</a><br>')
            }
        }).addTo(refUnivPublic);


        // Addis Medical Locations GeoJSON
        let refAddisMedical = L.layerGroup();
        L.geoJSON(medProvidersAddis, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, { radius: 10, color: 'red', weight: 2, fill: true }).bindPopup(feature.properties.provider + '</br> Specialty: ' + feature.properties.specialty + '</br> Phone: ' + feature.properties.phoneOffice + '</br>' + feature.properties.link + '</br> Amubulance? ' + feature.properties.AmbulanceService)
            }
        }).addTo(refAddisMedical);



        // Airports Black
        // custom icons for aiports
        // const YOUR_API_KEY = "72988d9175074bdcbc8fe8ce0005452a"; //TODO: Consider moving API keys to a configuration file or environment variables
        const airportIcon = new L.icon({
            iconUrl: 'https://api.geoapify.com/v1/icon/?type=awesome&scaleFactor=1&color=%2372a2d4&size=small&icon=plane-departure&apiKey=' + YOUR_API_KEY, // YOUR_API_KEY is already defined at the top
            cursor: 'pointer',
            anchor: 'bottom',
            offset: [0, 6]
        });

        var refAirport = L.layerGroup();
        loadGeoJsonPointLayer(
            refAirport,
            'data/locations/airports.geojson',
            airportIcon,
            function(properties) {
                // The airport GeoJSON has pre-formatted HTML in popup_html
                if (properties && properties.popup_html) {
                    return properties.popup_html;
                } else if (properties && properties.name) {
                    return properties.name; // Fallback to name if popup_html is missing
                }
                return null; // No popup if neither is present
            }
        );

        // Ambassador's Fund for Cultural Pres
        var blueIcon = new L.Icon({
            iconUrl: 'https://api.geoapify.com/v1/icon/?type=material&color=%23325acb&size=large&icon=landmark&iconType=awesome&scaleFactor=2&apiKey=' + YOUR_API_KEY,
            // iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
            // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [24, 40],
            iconAnchor: [5, 18],
            // popupAnchor: [1, -34]
            // iconSize: [25, 41],
            //shadowSize: [41, 41]
        });

        var refAFCP = L.layerGroup();
        loadGeoJsonPointLayer(
            refAFCP,
            'data/cultural/afcp_sites.geojson',
            blueIcon,
            function(properties) {
                if (properties && properties.name && properties.year) {
                    return `<p>${properties.name}<br/>${properties.year}</p>`;
                } else if (properties && properties.name) {
                    return `<p>${properties.name}</p>`; // Fallback if year is missing
                }
                return null; // No popup if essential properties are missing
            }
        );

        // American Spaces
        var amSpaces = L.layerGroup();

        fetch('data/locations/american_spaces.geojson')
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 10,
                            color: 'blue',
                            weight: 3,
                            fill: true
                        });
                    },
                    onEachFeature: function (feature, layer) {
                        if (feature.properties && feature.properties.name) {
                            layer.bindPopup(feature.properties.name);
                        }
                    }
                }).addTo(amSpaces);
            })
            .catch(error => console.error('Error loading American Spaces GeoJSON:', error));


        // Places of Interest
        var refPOI = L.layerGroup();

        // Add permanent tooltips without markers
        var tooltipGERD = L.tooltip({
            permanent: true,
            direction: 'top'
        }).setContent('Grand Ethiopian Renaissance Dam')
            .setLatLng([11.21562, 35.09299])
            .addTo(refPOI);

        var tooltipLaLib = L.tooltip({
            permanent: true,
            direction: 'top'
        }).setContent('Lalibela')
            .setLatLng([12.036, 39.046])
            .addTo(refPOI);

        var tooltipICS = L.tooltip({
            permanent: true,
            direction: 'top'
        }).setContent('Int Community School')
            .setLatLng([8.9955, 38.7286])
            .addTo(refPOI);

        var tooltipEMB = L.tooltip({
            permanent: true,
            direction: 'top'
        }).setContent('US Embassy')
            .setLatLng([9.0574, 38.7630])
            .addTo(refPOI);

        //////   ACLED

        // ACLED WITH JSON from API
        let daySpan30 = 30
        let daySpan45 = 45
        let daySpan60 = 60
        let daySpan90 = 90

        let today = new Date();

        let DaysAgo = new Date();
        DaysAgo.setDate(today.getDate() - daySpan90);

        let todayStr = today.toISOString().split('T')[0];
        let DaysAgoStr = DaysAgo.toISOString().split('T')[0];

        // USE "OR for multi ISO"
        // 232 Eritera; 262 Djibouti; 887 Yemen; 231 Ethiopia; 729 Sudan; 686 Senagal;

        // ACLED Data Layer
        let apiURL = `https://api.acleddata.com/acled/read/?key=${ACLED_API_KEY}&email=davisse@fan.gov&iso=231|686&event_date=${DaysAgoStr}|${todayStr}&event_date_where=BETWEEN`;
        let refACLED = L.layerGroup();
        var acledMarkers = L.markerClusterGroup();

        fetch(apiURL)
            .then(response => response.json())
            .then(jsonData => {
                const events = jsonData.data;
                for (const event of events) {
                    const latlng = [parseFloat(event.latitude), parseFloat(event.longitude)];

                    var circleMarker = L.circleMarker(latlng, { radius: 10, color: 'red', weight: 2, fill: true })
                        .bindPopup(event.event_date + '</br>' + event.sub_event_type + '</br>' + event.notes);

                    acledMarkers.addLayer(circleMarker);
                }
                refACLED.addLayer(acledMarkers);
            })
            .catch(error => console.error('Error:', error));


        ///////  END ACLED


        var refScholarsWoredas = L.layerGroup();

// var scholarMarkers is now loaded from data/education/scholar_woredas.js

var maxCount = Math.max(...scholarMarkers.map(m => m.count));
var minCount = Math.min(...scholarMarkers.map(m => m.count));
function scaleRadius(count) {
    return 4 + ((count - minCount) / (maxCount - minCount)) * (12 - 4);
}

scholarMarkers.forEach(function (entry) {
    var marker = L.circleMarker([entry.lat, entry.lng], {
        radius: scaleRadius(entry.count),
        color: "#003366",
        weight: 2,
        fillOpacity: 0
    }).bindPopup(`<b>${entry.name}</b><br/>Scholars: ${entry.count}`);
    refScholarsWoredas.addLayer(marker);
});

                //// WWW
                var wwwLayer = L.layerGroup();

                // Fetch the GeoJSON file and add it to the layer
                fetch('data/WhoDoesWhat/241208www.geojson')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok " + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        L.geoJSON(data, {
                            pointToLayer: function (feature, latlng) {
                                return L.circleMarker(latlng, {
                                    radius: 10,
                                    color: feature.properties.Donor && feature.properties.Donor.includes("USAID") ? "blue" : "green", // Blue for USAID, green otherwise
                                    fillColor: feature.properties.Donor && feature.properties.Donor.includes("USAID") ? "lightblue" : "lightgreen",
                                    fillOpacity: 0.25
                                });
                            },
                            onEachFeature: function (feature, layer) {
                                // Generate a popup with all properties
                                let popupContent = '<b>Properties:</b><br>';
                                for (let key in feature.properties) {
                                    popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                                }
                                layer.bindPopup(popupContent);
                            }
                        }).addTo(wwwLayer);
                    })
                    .catch(error => {
                        console.error('Error loading the GeoJSON:', error);
                    });

                ///  END

                // SCALE
                L.control.scale({
                    imperial: false,
                }).addTo(map);


                // Layer control
                var baseMaps = {
                    "Open Street Map": osmLayer,
                    "Satellite": googleSat,
                    "Streets": googleStreets,
                    "Terrain": googleTerrain,
                };

                // Add the layers to the map
                var overlays = {
                    "Woredas": refGeoJSON,
                    "Regions": refRegion,
                    "All Incidents": refAllIncidents, // Added main incident layer
                    "ACLED past 90 Days": refACLED,
                    "Airports": refAirport,
                    "Amb Fund Cultural Pres": refAFCP,
                    "Public Universities": refUnivPublic,
                    "American Spaces": amSpaces,
                    "Coordinates (deselect other layers)": refLATLNGMGRS, // Add the new LAT-LNG-MGRS layer
                    "Places of Interest": refPOI,
                    "Addis Medical": refAddisMedical,
                    "Aid Locations (USAID in blue)": wwwLayer,
                    "EducationUSA Scholars": refScholarsWoredas,
                };

                L.control.layers(baseMaps, overlays).addTo(map);

                // Load the initial GeoJSON data for Woredas and Regions
                loadGeoJSON(refGeoJSON, 'data/adminLevels/ET_admin3_2023.geojson');
                loadGeoJSON(refRegion, 'data/adminLevels/ET_admin1_2023.geojson');

                // Function to get date X days ago
                function getDateXDaysAgo(days) {
                    var date = new Date();
                    date.setDate(date.getDate() - days);
                    return date;
                }

                // Event listener for the select menu to change the visible layers
                // Removed event listener for 'incidentFilter' as the element was removed from HTML

            })
            .catch(error => console.error('Error loading GeoJSON:', error));

        // Add click event listener for the map to display a single marker
        var singleMarker = null;
        map.on('click', function (e) {
            // Get latitude and longitude from the event
            var lat = e.latlng.lat;
            var lng = e.latlng.lng;
            var mgrsCoords = mgrs.forward([lng, lat]);

            // If the marker already exists, update its position and popup
            if (singleMarker) {
                singleMarker.setLatLng([lat, lng])
                    .setPopupContent(
                        "<b>Latitude:</b> " + lat.toFixed(4) +
                        "<br><b>Longitude:</b> " + lng.toFixed(4) +
                        "<br><b>MGRS:</b> " + mgrsCoords
                    )
                    .openPopup();
            } else {
                // If the marker doesn't exist, create it and add to the map
                singleMarker = L.marker([lat, lng]).addTo(refLATLNGMGRS);
                singleMarker.bindPopup(
                    "<b>Latitude:</b> " + lat.toFixed(4) +
                    "<br><b>Longitude:</b> " + lng.toFixed(4) +
                    "<br><b>MGRS:</b> " + mgrsCoords
                ).openPopup();
            }
        });
