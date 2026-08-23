import { writeLocaleStorage } from '../utils/localeStorageUtils.js';
import { LOCAL_STORAGE_KEYS } from '../appConsts.js';
import { app } from '../app.js';
import { TABLE_COMPONENT_ID } from './tableComponent.js';

(() => {
  const saveButton = document.getElementById('boton-guardar-direccion');
  saveButton.addEventListener('click', () => {
    if (!app.state.currentCoordinate || !app.state.currentCoordinate.latitud) {
      alert('No hay dirección para guardar. Por favor, selecciona una ubicación primero.');
      return;
    }

    if (app.state.coordinates.add(app.state.currentCoordinate)) {
      writeLocaleStorage(
        LOCAL_STORAGE_KEYS.COORDINATES,
        Array.from(app.state.coordinates.getItems().entries())
      );
      alert('Dirección guardada en el almacenamiento local.');
      app.components.get(TABLE_COMPONENT_ID).loadCoordinates();
    } else {
      alert('Este lugar ya está en tu lista de guardados.');
    }
  });
})(app);
