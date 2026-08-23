import { app } from '../app.js';
import { WEATHER_COMPONENT_ID } from './weatherComponent.js';
import { showWeatherInfo } from '../utils/weatherUtils.js';
import { fetchLocationByCoordinates } from '../api/openStreetMapApi.js';
import { beautifulCoordinateString } from '../utils/coordinateUtils.js';

export const MAP_COMPONENT_ID = 'map-component';

(() => {
  const map = L.map('map', { scrollWheelZoom: true }).setView([40.4168, -3.7038], 5);
  let currentMarker = null;

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  let popup = L.popup();

  async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    const datosClima = await app.components.get(WEATHER_COMPONENT_ID).getWeather(lat, lon);

    await setMarker(lat, lon);
    showWeatherInfo(datosClima);

    try {
      const location = await fetchLocationByCoordinates(lat, lon);

      popup
        .setLatLng(e.latlng)
        .setContent(
          'You clicked the map at ' +
            beautifulCoordinateString(lat, lon) +
            '<br>' +
            location.display_name +
            '<br>🌡️ Temp: ' +
            datosClima.temperatura +
            ' ' +
            datosClima.unidadTemp +
            '<br>💨 Viento: ' +
            datosClima.viento +
            ' ' +
            datosClima.unidadViento
        )
        .openOn(map);

      app.state.currentCoordinate = {
        latitud: lat,
        longitud: lon,
        nombreLugar: location.display_name.split(',').slice(0, 2).join(', '),
      };
    } catch (error) {
      console.error('Error consulting Nominatim:', error);
    }
  }
  map.on('click', onMapClick);

  async function setMarker(lat, lon, nombreLugar, datosClima) {
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }
    //Si solo le paso lat y lon, no le pongo popup. Si le paso nombreLugar y datosClima, le pongo el popup con info del clima
    if (!nombreLugar) {
      currentMarker = L.marker([lat, lon]).addTo(map);
      return;
    }

    const contenidoPopup = `
    <b>${nombreLugar}</b><br>
    🌡️ Temp: ${datosClima.temperatura} ${datosClima.unidadTemp}<br>
    💨 Viento: ${datosClima.viento} ${datosClima.unidadViento}
`;

    currentMarker = L.marker([lat, lon]).addTo(map).bindPopup(contenidoPopup).openPopup();
  }

  const mapComponent = {
    map,
    currentMarker,
    setMarker,
  };
  app.components.set(MAP_COMPONENT_ID, mapComponent);
})(app);
