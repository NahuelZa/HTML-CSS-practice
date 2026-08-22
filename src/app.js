import {SetDeDirecciones} from "./utils/setDirecciones.js";
import { readLocaleStorage } from "./utils/localeStorageUtils.js";
import { LOCAL_STORAGE_KEYS } from "./appConsts.js";

export const app = {
  state: {
    currentCoordinate: null,
    coordinates: new SetDeDirecciones(),
  },
  // component-id <-> component-object
  components: new Map(),
}


// Función para hidratar el estado desde localStorage al iniciar la app
const initStorageData = () => {
    const rawData = readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES) ?? [];
    const savedCoordinates = new Map(rawData);
   
    savedCoordinates.forEach((direccion) => {
        // En caso de que se guardara la entrada completa [key, value]
        const coord = Array.isArray(direccion) ? direccion[1] : direccion;
        
    });
};

// Ejecutamos la carga de datos iniciales
initStorageData();