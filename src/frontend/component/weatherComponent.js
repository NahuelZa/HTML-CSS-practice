import { fetchWeatherByCoordinates } from '../api/openMeteoApi.js';
import { app } from '../app.js';

export const WEATHER_COMPONENT_ID = 'weather-component';

(() => {
  async function getWeather(lat, lon) {
    try {
      const data = await fetchWeatherByCoordinates(lat, lon);
      return {
        temperatura: data.current.temperature_2m,
        unidadTemp: data.current_units.temperature_2m,
        viento: data.current.wind_speed_10m,
        unidadViento: data.current_units.wind_speed_10m,
      };
    } catch (error) {
      console.error('Error al obtener el clima:', error);
      alert('No se pudo obtener el clima para la ubicación seleccionada.');
    }
  }

  const weatherCompoent = {
    getWeather,
  };
  app.components.set(WEATHER_COMPONENT_ID, weatherCompoent);
})(app);
