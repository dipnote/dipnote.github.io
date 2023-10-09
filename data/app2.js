let gsheetAPI = `https://script.google.com/a/macros/amspaceseth.net/s/AKfycbzVZnMQZOHIWIzgCsLhFZ8ypygBoUt7REaoMqu1mkGHKW0aLHwxGfM1q0BLHAVRmdo/exec`

let refAccount = L.layerGroup();

fetch(gsheetAPI)
    .then(response => response.json())
    .then(jsonData => {
        const events = jsonData.data;
        for (const event of events) {
            const latlng = [parseFloat(event.LAT), parseFloat(event.LON)];
            let color;

            // if (event.disorder_type === "Political violence") {
            //     color = 'red';
            // } else if (event.disorder_type === "Demonstrations") {
            //     color = 'darkgreen';
            // } else {
            //     color = 'gray';
            // }

            L.circleMarker(latlng, { radius: 10, color: color, weight: 2, fill: true })
                .bindPopup(event.NameFull + '</br>' + event.Program + '</br>' + event.InstitutionPrimary)
                .addTo(refAccount);
        }
    })
    .catch(error => console.error('Error:', error));
