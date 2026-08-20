import './style.pcss';
import 'bootstrap/dist/js/bootstrap.js';
import { addAdressToLocalStorage, getDireccion, removeDireccion, removeDireccionSingle } from "./utils/saveAdress.js";
import { SetDeDirecciones } from './utils/setDirecciones.js';

let map = L.map('map').setView([51.505, -0.09], 13);
let marcadorActual = null;
let datosDireccion = {};
let setDeDirecciones = new SetDeDirecciones();
const direccionesGuardadas = getDireccion();
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

async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    const datosClima = await obtenerClima(lat, lon);
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    await setearMarcador(lat, lon);
    await mostrarInfoClima(datosClima);

    try {
        const response = await fetch(url);
        const lugar = await response.json();

        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString() + "<br>" + lugar.display_name + "<br>🌡️ Temp: " + datosClima.temperatura + " " + datosClima.unidadTemp + "<br>💨 Viento: " + datosClima.viento + " " + datosClima.unidadViento)
            .openOn(map);

        datosDireccion = {
            latitud: lat,
            longitud: lon,
            nombreLugar: lugar.display_name
        };
    } catch (error) {
        console.error('Error consulting Nominatim:', error);
    }
}

map.on('click', onMapClick);

async function buscarDireccion() {
    const textoBusqueda = document.getElementById('buscador-ciudad').value;
    if (!textoBusqueda) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textoBusqueda)}`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.length > 0) {
            const lugar = datos[0];
            const lat = parseFloat(lugar.lat);
            const lon = parseFloat(lugar.lon);

            datosDireccion = {
                latitud: lat,
                longitud: lon,
                nombreLugar: lugar.display_name
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`;

    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

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

botonGuardarDireccion.addEventListener('click', () => {
    if (!datosDireccion || !datosDireccion.latitud) {
        alert('No hay dirección para guardar. Por favor, selecciona una ubicación primero.');
        return;
    }

    if (setDeDirecciones.add(datosDireccion)) {
        addAdressToLocalStorage(setDeDirecciones);
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

    const direccionesGuardadas = getDireccion();
    let htmlCompleto = '';

    direccionesGuardadas.forEach((direccion) => {
        htmlCompleto += crearFilaHTML(direccion);
    });

    table.innerHTML = htmlCompleto;
};

const crearFilaHTML = (dir) => `
    <tr>
        <td>${dir.latitud}, ${dir.longitud}</td>
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
        map.setView([lat, lon], 13);
    }
});

table.addEventListener('click', async (event) => {
    const link = event.target.closest('.eliminar-direccion');

    if (link) {
        event.preventDefault();
        const lat = link.dataset.lat;
        const lon = link.dataset.lon;
        setDeDirecciones.delete(lat, lon);
        addAdressToLocalStorage(setDeDirecciones);

        cargarDireccionesGuardadasEnTabla();
        if (marcadorActual) {
            map.removeLayer(marcadorActual);
            marcadorActual = null;
        }
    }
});

cargarDireccionesGuardadasEnTabla();