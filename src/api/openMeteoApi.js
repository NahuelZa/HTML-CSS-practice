const apiUrl = 'https://api.open-meteo.com/v1/'

export const fetchWeatherByCoordinates = async (lat, lon) => {
  const res = await fetch(apiUrl + `forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code`);
  return await res.json();
}
