const apiUrl = 'https://nominatim.openstreetmap.org/';

export const fetchLocationByCoordinates = async (lat, lon) => {
  const res = await fetch(apiUrl + `reverse?format=json&lat=${lat}&lon=${lon}`);
  return await res.json();
};

export const fetchLocationByName = async (name) => {
  const res = await fetch(apiUrl + `search?format=json&q=${encodeURIComponent(name)}`);
  return await res.json();
};
