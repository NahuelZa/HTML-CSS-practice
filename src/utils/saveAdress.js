export const addAdressToLocalStorage = (setDeDirecciones) => {
  const parseDireccion = JSON.stringify(setDeDirecciones.values);
  localStorage.setItem("direccion", parseDireccion);
};
export const getDireccion = () => {
  const data = localStorage.getItem("direccion");
  return data ? JSON.parse(data) : [];
};
export const removeDireccion = () => {
  localStorage.removeItem("direccion");
};
export const removeDireccionSingle = (lat,lon) => {
  const direcciones = getDireccion();  
  const nuevasDirecciones = direcciones.filter((dir) => 
    !(dir.latitud == lat && dir.longitud == lon)
  );
  addAdressToLocalStorage(nuevasDirecciones);
};
