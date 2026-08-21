import {readLocaleStorage, writeLocaleStorage} from "../utils/localeStorageUtils.js";
import {LOCAL_STORAGE_KEYS} from "../appConsts.js";
import {beautifulCoordinateString} from "../utils/coordinateUtils.js";
import {WEATHER_COMPONENT_ID} from "./weatherComponent.js";
import {showWeatherInfo} from "../utils/weatherUtils.js";
import {app} from "../app.js";
import {MAP_COMPONENT_ID} from "./mapComponent.js";

export const TABLE_COMPONENT_ID = 'table-component';

(
  (app) => {
    const table = document.getElementById('data-table');

    const loadCoordinates = () => {
      if (app.state.currentCoordinate) {
        table.innerHTML += renderRow(app.state.currentCoordinate);
        return;
      }

      const savedCoordinates = new Map(readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES) ?? []);
      debugger

      let html = '';
      savedCoordinates.forEach((c) => {
        html += renderRow(c);
      });
      table.innerHTML = html;
    };

    const renderRow = (coordinate) => `
    <tr>
        <td>${beautifulCoordinateString(coordinate.latitud, coordinate.longitud)}</td>
        <td>
            <a href="#" class="direccion-link" data-lat="${coordinate.latitud}" data-lon="${coordinate.longitud}">
                ${coordinate.nombreLugar}
            </a>
        </td>
        <td>
            <button class="btn btn-danger btn-sm eliminar-direccion" data-lat="${coordinate.latitud}" data-lon="${coordinate.longitud}">
                Eliminar
            </button>
        </td>
    </tr>`;

    table.addEventListener('click', async (event) => {
      const link = event.target.closest('.direccion-link');

      if (link) {
        event.preventDefault();
        const lat = link.dataset.lat;
        const lon = link.dataset.lon;
        const nombreLugar = link.textContent.trim();
        const clima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(lat, lon);
        app.components.get(MAP_COMPONENT_ID).setMarker(lat, lon, nombreLugar, clima);
        showWeatherInfo(clima);
        app.components.get(MAP_COMPONENT_ID).map.flyTo([lat, lon], 13, {duration: 0.8});
      }
    });

    table.addEventListener('click', async (event) => {
      const link = event.target.closest('.eliminar-direccion');

      if (link) {
        event.preventDefault();
        const lat = link.dataset.lat;
        const lon = link.dataset.lon;
        app.state.state.coordinates.delete(lat, lon);
        writeLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES, Array.from(app.state.state.coordinates.getItems().entries()));

        loadCoordinates();
        const currentMarker = app.components.get(MAP_COMPONENT_ID).currentMarker;
        if (currentMarker) {
          app.components.get(MAP_COMPONENT_ID).map.removeLayer(currentMarker);
          app.components.get(MAP_COMPONENT_ID).currentMarker = null;
        }
      }
    });

    const tableComponent = {
      loadCoordinates,
    }
    app.components.set(TABLE_COMPONENT_ID, tableComponent);
  }
)(app)
