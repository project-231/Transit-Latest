import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const appsettings = {
    databaseURL: "https://sample-7ef53-default-rtdb.firebaseio.com/"
};

const app = initializeApp(appsettings);
const database = getDatabase(app);
const BUSESRef = ref(database, "LIST OF BUSES");

// Initialize the map
var map = L.map('map').setView([10.8505, 76.2711], 8);

// Add the OpenStreetMap tiles as the base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let currentMarker = null;

// Function to retrieve location coordinates of a specific bus and display it on the map
async function getBusLocation(busName) {
    try {
        const snapshot = await get(BUSESRef);
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const busData = childSnapshot.val();
                if (busData.bus_name === busName) {
                    const latitude = busData.latitude;
                    const longitude = busData.longitude;
                    console.log(`Location of bus ${busName}: Latitude - ${latitude}, Longitude - ${longitude}`);
                    // Add a marker to the map at the retrieved location
                    if (currentMarker) {
                        map.removeLayer(currentMarker);
                     }

                    currentMarker = L.marker([latitude, longitude]).addTo(map)
                    map.setView(currentMarker.getLatLng(), 20);

                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            const locationbox = document.getElementById('locationbox'); // Define locationDiv
                            if (data.display_name) {
                                // Extracting just the name of the place
                                const addressComponents = data.display_name.split(', ');
                                const placeName_0 = addressComponents[0];
                                const placeName_1 = addressComponents[1];
                                const placeName_2 = addressComponents[2];
                                // Display the name of the place
                                locationbox.style.display = 'block';
                                locationbox.innerText = `Location: ${placeName_0},${placeName_1},${placeName_2}`; // Change locationDiv to locationbox
                            } else {
                                locationbox.style.display = 'block';
                                locationbox.innerText = "Location not found"; // Change locationDiv to locationbox
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            locationbox.style.display = 'block';
                            locationbox.innerText = "Error retrieving location"; // Change locationDiv to locationbox
                        });
                }
            });
            
        } else {
            console.log(`No bus data found in the database.`);
        }
    } catch (error) {
        console.error("Error fetching bus data:", error);
    }
}

var busName = localStorage.getItem('routescheduleid');
console.log(busName);
getBusLocation(busName);
setInterval(() => getBusLocation(busName), 7000);
