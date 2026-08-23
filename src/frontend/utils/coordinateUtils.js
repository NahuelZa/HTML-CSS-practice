export const beautifulCoordinateString = (lat, lon) => {
  const latChar = lat >= 0 ? 'N' : 'S';
  const lonChar = lon >= 0 ? 'E' : 'O';

  function beautifulCoordinate(val, coordinate) {
    return Math.abs(val).toFixed(3) + '°' + coordinate;
  }

  return `${beautifulCoordinate(lat, latChar)}, ${beautifulCoordinate(lon, lonChar)}`;
};
