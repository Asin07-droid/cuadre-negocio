// src/infrastructure/indexeddb/productosRepository.js

import { getDB } from './db.js';

/**
 * Obtiene todos los productos
 */
export function obtenerProductos() {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readonly');
    const store = transaction.objectStore('productos');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene un producto por su ID
 */
export function obtenerProductoPorId(id) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readonly');
    const store = transaction.objectStore('productos');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Agrega un nuevo producto
 */
export function agregarProducto(producto) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readwrite');
    const store = transaction.objectStore('productos');
    const request = store.add(producto);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Actualiza un producto existente
 */
export function actualizarProducto(producto) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readwrite');
    const store = transaction.objectStore('productos');
    const request = store.put(producto);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina un producto
 */
export function eliminarProducto(id) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readwrite');
    const store = transaction.objectStore('productos');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Busca productos por nombre (búsqueda parcial)
 */
export function buscarProductos(termino) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['productos'], 'readonly');
    const store = transaction.objectStore('productos');
    const index = store.index('nombre');
    const request = index.getAll();

    request.onsuccess = () => {
      const resultados = request.result.filter(p => 
        p.nombre.toLowerCase().includes(termino.toLowerCase())
      );
      resolve(resultados);
    };
    request.onerror = () => reject(request.error);
  });
}