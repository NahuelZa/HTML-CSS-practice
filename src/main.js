import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';

import {app} from './app.js';

// components
import './component/weatherComponent.js';
import './component/tableComponent.js';
import './component/mapComponent.js';
import './component/save-buttonComponent.js';
import './component/searchBarComponent.js';
// TODO: import components


import { readLocaleStorage } from './utils/localeStorageUtils.js';
import { LOCAL_STORAGE_KEYS } from './appConsts.js';



const initStorageData = () => {
    const rawData = readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES) ?? [];
    const savedCoordinates = new Map(rawData);

    savedCoordinates.forEach((direccion) => {
        app.state.coordinates.add(direccion)
        
    });
};

initStorageData();