const readLocaleStorage = (key) => {
  return JSON.parse(localStorage.getItem(key))
}

const writeLocaleStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const removeLocaleStorage = (key) => localStorage.removeItem(key)

export {readLocaleStorage, writeLocaleStorage, removeLocaleStorage}
