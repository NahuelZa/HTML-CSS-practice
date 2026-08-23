import { fetchLocationByName } from '../api/openStreetMapApi.js';
import { app } from '../app.js';

// TODO: move to search-bar component
export const searchLocation = async () => {
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
