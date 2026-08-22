export const showWeatherInfo = (weatherData) => {
  const div = document.getElementById('info-clima');
  div.innerHTML = `
    🌡️ Temp: ${weatherData.temperatura} ${weatherData.unidadTemp}<br>
    💨 Viento: ${weatherData.viento} ${weatherData.unidadViento}`;
}
