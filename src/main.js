import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';

import {app} from './app.js';

// components
import './component/weatherComponent.js';
import './component/tableComponent.js';
import './component/mapComponent.js';
// TODO: import components

import {readLocaleStorage, writeLocaleStorage} from "./utils/localeStorageUtils.js";
import {showWeatherInfo} from "./utils/weatherUtils.js";

import {LOCAL_STORAGE_KEYS} from "./appConsts.js";
import {TABLE_COMPONENT_ID} from "./component/tableComponent.js";
import {WEATHER_COMPONENT_ID} from "./component/weatherComponent.js";
import {MAP_COMPONENT_ID} from "./component/mapComponent.js";
import {searchLocation} from "./utils/locationUtils.js";


const loadSavedCoordinates = () => {
    new Map(readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES)).forEach((direccion) => {
        app.state.coordinates.add(direccion);
    });
    app.components.get(TABLE_COMPONENT_ID).loadCoordinates();
};
loadSavedCoordinates();

// TODO: create search-bar component
const searchBar = document.getElementById('formulario-busqueda');
searchBar.addEventListener('submit', async (event) => {
    event.preventDefault();

    await searchLocation();
    app.components.get(MAP_COMPONENT_ID).map.setView([app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud], 14);
    const datosClima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud);
    await app.components.get(MAP_COMPONENT_ID).setMarker(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud, app.state.currentCoordinate.nombreLugar, datosClima);
    showWeatherInfo(datosClima);
});

// TODO: create save-button component
const saveButton = document.getElementById('boton-guardar-direccion');
saveButton.addEventListener('click', () => {
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
