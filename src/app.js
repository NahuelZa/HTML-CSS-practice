import {SetDeDirecciones} from "./utils/setDirecciones.js";

export const app = {
  state: {
    currentCoordinate: null,
    coordinates: new SetDeDirecciones(),
  },
  // component-id <-> component-object
  components: new Map(),
}
