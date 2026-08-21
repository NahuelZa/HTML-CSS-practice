import {SetDeDirecciones} from "./utils/setDirecciones.js";

export const app = {
  state: {
    currentCoordinate: null,
    coordinates: new SetDeDirecciones(),
    // TODO: delete
    currentMarker: null,
    map: null,
    setMarker: null,
  },
  // component-id <-> component-object
  components: new Map(),
}
