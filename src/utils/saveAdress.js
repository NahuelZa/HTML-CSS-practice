import {readLocaleStorage, writeLocaleStorage} from "./localeStorageUtils.js";
import {LOCAL_STORAGE_KEYS} from "../appConsts.js";

/* TODO-JMP: ver que verga hace */
export const removeDireccionSingle = (lat, lon) => {
  const direcciones = readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES);
  const nuevasDirecciones = direcciones.filter((dir) =>
    !(dir.latitud == lat && dir.longitud == lon)
  );
  writeLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES, nuevasDirecciones);
};
