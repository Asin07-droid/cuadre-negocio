// src/infrastructure/indexeddb/turnosRepository.js

import { getDB } from './db.js';

/**
 * Obtiene todos los turnos
 */
export function obtenerTurnos() {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['turnos'], 'readonly');
    const store = transaction.objectStore('turnos');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene turnos por fecha
 */
export function obtenerTurnosPorFecha(fecha) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['turnos'], 'readonly');
    const store = transaction.objectStore('turnos');
    const index = store.index('fecha');
    const request = index.getAll(fecha);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Guarda un nuevo turno
 */
export function guardarTurno(turno) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['turnos'], 'readwrite');
    const store = transaction.objectStore('turnos');
    const request = store.add(turno);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Actualiza un turno existente
 */
export function actualizarTurno(turno) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['turnos'], 'readwrite');
    const store = transaction.objectStore('turnos');
    const request = store.put(turno);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene el último turno activo
 */
export function obtenerTurnoActivo() {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const transaction = db.transaction(['turnos'], 'readonly');
    const store = transaction.objectStore('turnos');
    const index = store.index('estado');
    const request = index.getAll('activo');

    request.onsuccess = () => {
      const activos = request.result;
      resolve(activos.length > 0 ? activos[activos.length - 1] : null);
    };
    request.onerror = () => reject(request.error);
  });
}