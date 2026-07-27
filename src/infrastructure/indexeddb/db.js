// src/infrastructure/indexeddb/db.js

let dbInstance = null;

export function abrirDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open('CuadreNegocioDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('productos')) {
        db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('ventas')) {
        db.createObjectStore('ventas', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('turnos')) {
        db.createObjectStore('turnos', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export function getDB() {
  if (!dbInstance) {
    throw new Error('Base de datos no abierta');
  }
  return dbInstance;
}