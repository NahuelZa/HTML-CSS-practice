import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';

import {app} from './app.js';

// components
import './component/weatherComponent.js';
import './component/tableComponent.js';

import {readLocaleStorage, writeLocaleStorage} from "./utils/localeStorageUtils.js";
import {fetchLocationByCoordinates, fetchLocationByName} from "./api/openStreetMapApi.js";
import {beautifulCoordinateString} from "./utils/coordinateUtils.js";
import {showWeatherInfo} from "./utils/weatherUtils.js";

import {LOCAL_STORAGE_KEYS} from "./appConsts.js";
import {TABLE_COMPONENT_ID} from "./component/tableComponent.js";
import {WEATHER_COMPONENT_ID} from "./component/weatherComponent.js";

app.state.map = L.map('map', { scrollWheelZoom:true }).setView([40.4168, -3.7038], 5);
const map = app.state.map;

const direccionesGuardadas = new Map(readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES));

//Cargo direcciones del localStorage al SetDeDirecciones para poder trabajar con ellas
const cargarDireccionesGuardadas = () => {
    if (direccionesGuardadas === null || direccionesGuardadas === undefined) return;
    direccionesGuardadas.forEach((direccion) => {
        app.state.coordinates.add(direccion);
    });
    app.components.get(TABLE_COMPONENT_ID).loadCoordinates();
};
cargarDireccionesGuardadas();

//Cargar el mapa
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let popup = L.popup();

async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;


    const datosClima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(lat, lon);

    await setearMarcador(lat, lon);
    showWeatherInfo(datosClima);

    try {
        const location = await fetchLocationByCoordinates(lat, lon);

        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + beautifulCoordinateString(lat, lon) + "<br>" + location.display_name + "<br>🌡️ Temp: " + datosClima.temperatura + " " + datosClima.unidadTemp + "<br>💨 Viento: " + datosClima.viento + " " + datosClima.unidadViento)
            .openOn(map);

        app.state.currentCoordinate = {
            latitud: lat,
            longitud: lon,
            nombreLugar: location.display_name.split(',').slice(0,2).join(', ')
        };
    } catch (error) {
        console.error('Error consulting Nominatim:', error);
    }
}

map.on('click', onMapClick);

async function buscarDireccion() {
    const textoBusqueda = document.getElementById('buscador-ciudad').value;
    if (!textoBusqueda) return;

    try {
        const datos = await fetchLocationByName(textoBusqueda);

        if (datos.length > 0) {
            const lugar = datos[0];
            const lat = parseFloat(lugar.lat);
            const lon = parseFloat(lugar.lon);

          app.state.currentCoordinate = {
                latitud: lat,
                longitud: lon,
                nombreLugar: lugar.display_name.split(',').slice(0,2).join(', ')

            };
        } else {
            alert('No se encontraron resultados para esa búsqueda.');
        }
    } catch (error) {
        console.error('Error consultando Nominatim:', error);
    }
}

async function setearMarcador(lat, lon, nombreLugar, datosClima) {
    if (app.state.currentMarker) {
        map.removeLayer(app.state.currentMarker);
    }
    //Si solo le paso lat y lon, no le pongo popup. Si le paso nombreLugar y datosClima, le pongo el popup con info del clima
    if (!nombreLugar) {
        app.state.currentMarker = L.marker([lat, lon]).addTo(map);
        return;
    }

    const contenidoPopup = `
    <b>${nombreLugar}</b><br>
    🌡️ Temp: ${datosClima.temperatura} ${datosClima.unidadTemp}<br>
    💨 Viento: ${datosClima.viento} ${datosClima.unidadViento}
`;

    app.state.currentMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(contenidoPopup)
        .openPopup();
}
app.state.setMarker = setearMarcador;

const formulario = document.getElementById('formulario-busqueda');
formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    await buscarDireccion();
    map.setView([app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud], 14);
    const datosClima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud);
    await setearMarcador(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud, app.state.currentCoordinate.nombreLugar, datosClima);
    showWeatherInfo(datosClima);
});

//GUARDAR DIRECCION EN LOCALSTORAGE

const botonGuardarDireccion = document.getElementById('boton-guardar-direccion');
botonGuardarDireccion.addEventListener('click', () => {
    if (!app.state.currentCoordinate || !app.state.currentCoordinate.latitud) {
        alert('No hay dirección para guardar. Por favor, selecciona una ubicación primero.');
        return;
    }

    if (app.state.coordinates.add(app.state.currentCoordinate)) {
        writeLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES, Array.from(app.state.coordinates.getItems().entries()));
        alert('Dirección guardada en el almacenamiento local.');
        app.components.get(TABLE_COMPONENT_ID).loadCoordinates();
        debugger
    } else {
        alert("Este lugar ya está en tu lista de guardados.");
    }
});
