import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';
import { SetDeDirecciones } from './utils/setDirecciones.js';
import {readLocaleStorage, writeLocaleStorage} from "./utils/localeStorageUtils.js";
import {LOCAL_STORAGE_KEYS} from "./appConsts.js";
import {fetchLocationByCoordinates, fetchLocationByName} from "./api/openStreetMapApi.js";
import {fetchWeatherByCoordinates} from "./api/openMeteoApi.js";

const map = L.map('map', { scrollWheelZoom:true }).setView([40.4168, -3.7038], 5);
let marcadorActual = null;
let datosDireccion = {};
let setDeDirecciones = new SetDeDirecciones();
const direccionesGuardadas = new Map(readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES));

const botonGuardarDireccion = document.getElementById('boton-guardar-direccion');
const table = document.getElementById('data-table');
const formulario = document.getElementById('formulario-busqueda');

//Cargo direcciones del localStorage al SetDeDirecciones para poder trabajar con ellas
const cargarDireccionesGuardadas = () => {
    if (direccionesGuardadas === null || direccionesGuardadas === undefined) return;
    direccionesGuardadas.forEach((direccion) => {
        setDeDirecciones.add(direccion);
    });
};
cargarDireccionesGuardadas();
//Cargar el mapa
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let popup = L.popup();

function agregarCoordenada(valor, letraMayorA0Grados, letraMenorA0Grados){
    const puntoCardinal = valor >= 0 ? letraMayorA0Grados : letraMenorA0Grados;
    return Math.abs(valor).toFixed(3) + '°' + puntoCardinal;
  }

async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    const datosClima = await obtenerClima(lat, lon);

    await setearMarcador(lat, lon);
    await mostrarInfoClima(datosClima);

    try {
        const location = await fetchLocationByCoordinates(lat, lon);

        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + agregarCoordenada(e.latlng.lat, 'N', 'S') + ", " + agregarCoordenada(e.latlng.lng, 'E', 'O') + "<br>" + location.display_name + "<br>🌡️ Temp: " + datosClima.temperatura + " " + datosClima.unidadTemp + "<br>💨 Viento: " + datosClima.viento + " " + datosClima.unidadViento)
            .openOn(map);

        datosDireccion = {
            latitud: lat,
            longitud: lon,
            nombreLugar: location.display_name.split(',').slice(0,2).join(', ')
        };
    } catch (error) {
        console.error('Error consulting Nominatim:', error);
    }
}

map.on('click', onMapClick);

async function buscarDireccion() {
    const textoBusqueda = document.getElementById('buscador-ciudad').value;
    if (!textoBusqueda) return;

    try {
        const datos = await fetchLocationByName(textoBusqueda);

        if (datos.length > 0) {
            const lugar = datos[0];
            const lat = parseFloat(lugar.lat);
            const lon = parseFloat(lugar.lon);

            datosDireccion = {
                latitud: lat,
                longitud: lon,
                nombreLugar: lugar.display_name.split(',').slice(0,2).join(', ')

            };
            return datosDireccion;
        } else {
            alert('No se encontraron resultados para esa búsqueda.');
        }
    } catch (error) {
        console.error('Error consultando Nominatim:', error);
    }
}

async function setearMarcador(lat, lon, nombreLugar, datosClima) {
    if (marcadorActual) {
        map.removeLayer(marcadorActual);
    }
    //Si solo le paso lat y lon, no le pongo popup. Si le paso nombreLugar y datosClima, le pongo el popup con info del clima
    if (!nombreLugar) {
        marcadorActual = L.marker([lat, lon]).addTo(map);
        return;
    }

    const contenidoPopup = `
    <b>${nombreLugar}</b><br>
    🌡️ Temp: ${datosClima.temperatura} ${datosClima.unidadTemp}<br>
    💨 Viento: ${datosClima.viento} ${datosClima.unidadViento}
`;

    marcadorActual = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(contenidoPopup)
        .openPopup();
}

async function obtenerClima(lat, lon) {
    try {
        const datos = await fetchWeatherByCoordinates(lat, lon);

        const datosClima = {
            temperatura: datos.current.temperature_2m,
            unidadTemp: datos.current_units.temperature_2m,
            viento: datos.current.wind_speed_10m,
            unidadViento: datos.current_units.wind_speed_10m
        };
        return datosClima;
    } catch (error) {
        console.error("Error al obtener el clima:", error);
        alert("No se pudo obtener el clima para la ubicación seleccionada.");
    }
}

async function mostrarInfoClima(datosClima) {
    const infoClimaDiv = document.getElementById('info-clima');
    infoClimaDiv.innerHTML = `
    🌡️ Temp: ${datosClima.temperatura} ${datosClima.unidadTemp}<br>
    💨 Viento: ${datosClima.viento} ${datosClima.unidadViento}`;
}


formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    datosDireccion = await buscarDireccion();
    map.setView([datosDireccion.latitud, datosDireccion.longitud], 14);
    const datosClima = await obtenerClima(datosDireccion.latitud, datosDireccion.longitud);
    await setearMarcador(datosDireccion.latitud, datosDireccion.longitud, datosDireccion.nombreLugar, datosClima);
    await mostrarInfoClima(datosClima);
});
//GUARDAR DIRECCION EN LOCALSTORAGE
botonGuardarDireccion.addEventListener('click', () => {
    if (!datosDireccion || !datosDireccion.latitud) {
        alert('No hay dirección para guardar. Por favor, selecciona una ubicación primero.');
        return;
    }

    if (setDeDirecciones.add(datosDireccion)) {
        writeLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES, Array.from(setDeDirecciones.getItems().entries()));
        alert('Dirección guardada en el almacenamiento local.');
        cargarDireccionesGuardadasEnTabla(datosDireccion);
    } else {
        alert("Este lugar ya está en tu lista de guardados.");
    }
});

const cargarDireccionesGuardadasEnTabla = (datosDireccion = null) => {
    if (datosDireccion) {
        table.innerHTML += crearFilaHTML(datosDireccion);
        return;
    }

    const direccionesGuardadas = new Map(readLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES) ?? []);
    let htmlCompleto = '';

    direccionesGuardadas.forEach((direccion) => {
        htmlCompleto += crearFilaHTML(direccion);
    });

    table.innerHTML = htmlCompleto;
};

const crearFilaHTML = (dir) => `
    <tr>
        <td>${agregarCoordenada(dir.latitud, 'N', 'S')}, ${agregarCoordenada(dir.longitud, 'E', 'O')}</td>
        <td>
            <a href="#" class="direccion-link" data-lat="${dir.latitud}" data-lon="${dir.longitud}">
                ${dir.nombreLugar}
            </a>
        </td>
        <td>
            <button class="btn btn-danger btn-sm eliminar-direccion" data-lat="${dir.latitud}" data-lon="${dir.longitud}">
                Eliminar
            </button>
        </td>
    </tr>
`;

table.addEventListener('click', async (event) => {
    const link = event.target.closest('.direccion-link');

    if (link) {
        event.preventDefault();
        const lat = link.dataset.lat;
        const lon = link.dataset.lon;
        const nombreLugar = link.textContent.trim();
        const clima = await obtenerClima(lat, lon);
        setearMarcador(lat, lon, nombreLugar, clima);
        mostrarInfoClima(clima);
        map.flyTo([lat, lon], 13, { duration: 0.8 });
    }
});

table.addEventListener('click', async (event) => {
    const link = event.target.closest('.eliminar-direccion');

    if (link) {
        event.preventDefault();
        const lat = link.dataset.lat;
        const lon = link.dataset.lon;
        setDeDirecciones.delete(lat, lon);
        writeLocaleStorage(LOCAL_STORAGE_KEYS.COORDINATES,Array.from(setDeDirecciones.getItems().entries()));

        cargarDireccionesGuardadasEnTabla();
        if (marcadorActual) {
            map.removeLayer(marcadorActual);
            marcadorActual = null;
        }
    }
});

cargarDireccionesGuardadasEnTabla();
