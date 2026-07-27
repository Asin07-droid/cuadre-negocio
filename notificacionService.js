// src/core/services/notificacionService.js
// Servicio de notificaciones (toasts) - VERSIÓN REDISEÑADA

let toastTimeout = null;

/**
 * Muestra una notificación tipo toast en la pantalla
 * @param {string} mensaje - Texto de la notificación
 * @param {string} tipo - 'success', 'error', 'info', 'warning'
 * @param {number} duracion - Duración en milisegundos (default: 3000)
 */
export function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
  // Eliminar toast existente
  const existing = document.getElementById('toastNotificacion');
  if (existing) {
    existing.remove();
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
  }

  // Colores según tipo - más sutiles y profesionales
  const colores = {
    success: { 
      bg: '#e8f5e9', 
      border: '2px solid #43a047', 
      text: '#1b5e20', 
      icon: '✅',
      shadow: '0 2px 8px rgba(46, 125, 50, 0.15)'
    },
    error: { 
      bg: '#fef2f2', 
      border: '2px solid #e53935', 
      text: '#c62828', 
      icon: '❌',
      shadow: '0 2px 8px rgba(198, 40, 40, 0.15)'
    },
    warning: { 
      bg: '#fff3e0', 
      border: '2px solid #fb8c00', 
      text: '#e65100', 
      icon: '⚠️',
      shadow: '0 2px 8px rgba(230, 81, 0, 0.15)'
    },
    info: { 
      bg: '#e3f2fd', 
      border: '2px solid #1e88e5', 
      text: '#0d47a1', 
      icon: 'ℹ️',
      shadow: '0 2px 8px rgba(13, 71, 161, 0.15)'
    },
  };

  const color = colores[tipo] || colores.info;

  // Crear toast - Diseño ALARGADO y DELGADO
  const toast = document.createElement('div');
  toast.id = 'toastNotificacion';
  toast.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background: ${color.bg};
    color: ${color.text};
    padding: 10px 16px;
    border-bottom: ${color.border};
    box-shadow: ${color.shadow};
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    animation: slideDownToast 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 44px;
    max-height: 56px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    box-sizing: border-box;
  `;

  // El mensaje solo con un emoji (no doble)
  toast.innerHTML = `
    <span style="font-size: 16px; flex-shrink: 0;">${color.icon}</span>
    <span style="flex: 1; text-align: center; line-height: 1.3; padding: 0 4px;">${mensaje}</span>
  `;

  // Agregar estilos de animación
  const styleId = 'toastStyles';
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideDownToast {
        from {
          opacity: 0;
          transform: translateY(-100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideUpToast {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-ocultar después de la duración
  toastTimeout = setTimeout(() => {
    if (toast) {
      toast.style.animation = 'slideUpToast 0.3s ease-in forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
    toastTimeout = null;
  }, duracion);

  // Clic para cerrar
  toast.addEventListener('click', () => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    toast.style.animation = 'slideUpToast 0.3s ease-in forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
}

// ============================================
// NOTIFICACIONES ESPECÍFICAS
// ============================================

export function notificacionExito(mensaje) {
  mostrarNotificacion(mensaje, 'success');
}

export function notificacionError(mensaje) {
  mostrarNotificacion(mensaje, 'error');
}

export function notificacionAdvertencia(mensaje) {
  mostrarNotificacion(mensaje, 'warning');
}

export function notificacionInfo(mensaje) {
  mostrarNotificacion(mensaje, 'info');
}

// ============================================
// NOTIFICACIONES PARA ACCIONES ESPECÍFICAS
// ============================================

export function notificacionTurnoCerrado(dependiente, total) {
  mostrarNotificacion(
    `Turno cerrado • ${dependiente} • $${total}`,
    'success',
    4000
  );
}

export function notificacionTurnoError() {
  mostrarNotificacion(
    'Error al cerrar el turno',
    'error',
    4000
  );
}

export function notificacionInventarioExportado(nombreArchivo) {
  mostrarNotificacion(
    `Inventario exportado: ${nombreArchivo}`,
    'success',
    3000
  );
}

export function notificacionInventarioImportado(importados, actualizados) {
  mostrarNotificacion(
    `Importación: ${importados} nuevos • ${actualizados} actualizados`,
    'success',
    4000
  );
}

export function notificacionInventarioError(mensaje) {
  mostrarNotificacion(
    `Error al importar: ${mensaje}`,
    'error',
    4000
  );
}

export function notificacionPDFGenerado() {
  mostrarNotificacion(
    'PDF generado correctamente',
    'success',
    3000
  );
}

export function notificacionPDFError() {
  mostrarNotificacion(
    'Error al generar el PDF',
    'error',
    3000
  );
}

export function notificacionWhatsAppEnviado() {
  mostrarNotificacion(
    'Abriendo WhatsApp...',
    'info',
    2000
  );
}

export function notificacionProductoCargado(cantidad) {
  mostrarNotificacion(
    `${cantidad} productos cargados del inventario`,
    'success',
    3000
  );
}

export function notificacionProductoAgregado(nombre) {
  mostrarNotificacion(
    `"${nombre}" agregado`,
    'success',
    2500
  );
}

export function notificacionProductoEliminado(nombre) {
  mostrarNotificacion(
    `"${nombre}" eliminado`,
    'warning',
    2500
  );
}

export function notificacionProductoActualizado(nombre) {
  mostrarNotificacion(
    `"${nombre}" actualizado`,
    'success',
    2500
  );
}

export function notificacionNuevoTurno() {
  mostrarNotificacion(
    'Turno reiniciado',
    'info',
    2500
  );
}

export function notificacionSinProductos() {
  mostrarNotificacion(
    'No hay productos en el inventario',
    'warning',
    2500
  );
}

export function notificacionImportacionCancelada() {
  mostrarNotificacion(
    'Importación cancelada',
    'warning',
    2000
  );
}