import { app } from '../app.js';
import { WEATHER_COMPONENT_ID } from './weatherComponent.js';
import { showWeatherInfo } from '../utils/weatherUtils.js';
import { MAP_COMPONENT_ID } from './mapComponent.js';
import { fetchLocationByName } from '../api/openStreetMapApi.js';

export const SEARCH_BAR_COMPONENT_ID = 'search-bar-component';

(() => {
  const searchLocation = async () => {
    const name = document.getElementById('buscador-ciudad').value;
    if (!name) return;

    try {
      const data = await fetchLocationByName(name);

      if (data.length > 0) {
        const lugar = data[0];
        const lat = parseFloat(lugar.lat);
        const lon = parseFloat(lugar.lon);

        app.state.currentCoordinate = {
          latitud: lat,
          longitud: lon,
          nombreLugar: lugar.display_name.split(',').slice(0, 2).join(', '),
        };
      } else {
        alert('No se encontraron resultados para esa búsqueda.');
      }
    } catch (error) {
      console.error('Error consultando Nominatim:', error);
    }
  };

  const searchBar = document.getElementById('formulario-busqueda');
  searchBar.addEventListener('submit', async (event) => {
    event.preventDefault();

    await searchLocation();
    app.components
      .get(MAP_COMPONENT_ID)
      .map.setView([app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud], 14);
    const datosClima = await app.components
      .get(WEATHER_COMPONENT_ID)
      .getWeather(app.state.currentCoordinate.latitud, app.state.currentCoordinate.longitud);
    await app.components
      .get(MAP_COMPONENT_ID)
      .setMarker(
        app.state.currentCoordinate.latitud,
        app.state.currentCoordinate.longitud,
        app.state.currentCoordinate.nombreLugar,
        datosClima
      );
    showWeatherInfo(datosClima);
  });

  const searchbarComponent = {
    searchLocation,
  };

  app.components.set(SEARCH_BAR_COMPONENT_ID, searchbarComponent);
})(app);
