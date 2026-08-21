import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';

import {app} from './app.js';

// components
import './component/weatherComponent.js';
import './component/tableComponent.js';
import './component/mapComponent.js';

import {readLocaleStorage, writeLocaleStorage} from "./utils/localeStorageUtils.js";
import {showWeatherInfo} from "./utils/weatherUtils.js";

import {LOCAL_STORAGE_KEYS} from "./appConsts.js";
import {TABLE_COMPONENT_ID} from "./component/tableComponent.js";
import {WEATHER_COMPONENT_ID} from "./component/weatherComponent.js";
import {fetchLocationByName} from "./api/openStreetMapApi.js";
import {MAP_COMPONENT_ID} from "./component/mapComponent.js";

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

const formulario = document.getElementById('formulario-busqueda');
formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    await buscarDireccion();
    app.components.get(MAP_COMPONENT_ID).map.setView([app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud], 14);
    const datosClima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud);
    await app.components.get(MAP_COMPONENT_ID).setMarker(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud, app.state.currentCoordinate.nombreLugar, datosClima);
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
