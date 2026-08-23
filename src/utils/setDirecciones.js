export class SetDeDirecciones {
  constructor() {
    this.items = new Map();
  }

  // Agrega la dirección usando latitud y longitud como clave única
  add(direccion) {
    // Creamos una clave única uniendo latitud y longitud
    const hashKey = `${direccion.latitud}_${direccion.longitud}`;

    if (this.items.has(hashKey)) {
      return false;
    }

    // Si no existe, lo guarda y avisa devolviendo true
    this.items.set(hashKey, direccion);
    return true;
  }

  // Verifica si la ubicación ya existe en el conjunto
  has(latitud, longitud) {
    return this.items.has(`${latitud}_${longitud}`);
  }

  // Elimina una ubicación por sus coordenadas
  delete(latitud, longitud) {
    return this.items.delete(`${latitud}_${longitud}`);
  }

  // Devuelve una lista con todos los diccionarios limpios
  get values() {
    return Array.from(this.items.values());
  }

  getItems() {
    return this.items;
  }

  // Te da el total de lugares guardados
  get size() {
    return this.items.size;
  }
}
