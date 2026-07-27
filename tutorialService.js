// src/core/services/tutorialService.js
// TUTORIAL - CON EXPLICACIONES ACTUALIZADAS (SIN PDF)

const CLAVE_TUTORIAL = 'tutorial_completado';

// =============================================
// ESTADO
// =============================================

export function tutorialYaVisto() {
  try {
    return localStorage.getItem(CLAVE_TUTORIAL) === 'true';
  } catch (e) {
    return false;
  }
}

export function marcarTutorialVisto() {
  try {
    localStorage.setItem(CLAVE_TUTORIAL, 'true');
  } catch (e) {}
}

export function resetearTutorial() {
  try {
    localStorage.removeItem(CLAVE_TUTORIAL);
  } catch (e) {}
}

var pasoActual = 0;
var pasos = [];
var opciones = {};
var paginaActual = null;
var timeoutId = null;

// =============================================
// DEFINICIÓN DE PASOS
// =============================================

function obtenerPasos() {
  return [
    // ==========================================
    // PASO 1: BIENVENIDA
    // ==========================================
    {
      pagina: 'cuadre',
      selector: null,
      titulo: '👋 ¡Bienvenido a Cuadre de Negocio!',
      texto: 'Soy <b>Marco Asín de TecnoRouteV</b>, el desarrollador de esta herramienta.<br><br>' +
             '🎁 Tienes <b>3 días de prueba GRATIS</b> para probar todas las funcionalidades.<br><br>' +
             '💰 Después del periodo de prueba, si te gusta la app, puedes adquirir la licencia contactándome directamente por WhatsApp.<br><br>' +
             '📱 Mi número está al final del tutorial.<br><br>' +
             '💡 <b>Flujo de trabajo:</b> Esta app está diseñada para que el cuadre diario sea rápido y eficiente.'
    },
    // ==========================================
    // PASO 2: TURNO
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.turno-selector',
      titulo: '🌞🌙 Paso 1: Elige tu Turno',
      texto: 'Lo primero que debes hacer al empezar tu jornada es <b>seleccionar el turno</b>.<br><br>' +
             '☀️ <b>Día</b> - Para tu jornada diurna (mañana/tarde).<br>' +
             '🌙 <b>Noche</b> - Para tu jornada nocturna.<br><br>' +
             '💡 El turno se guarda automáticamente y aparece en los reportes.<br><br>' +
             '📌 <b>Consejo:</b> Selecciona siempre el turno correcto antes de empezar a registrar productos.'
    },
    // ==========================================
    // PASO 3: DEPENDIENTE
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '#dependiente',
      titulo: '📝 Paso 2: Identifica al Responsable',
      texto: 'Escribe el <b>nombre del dependiente o responsable</b> del turno.<br><br>' +
             '✅ Los reportes llevarán este nombre.<br>' +
             '✅ El historial quedará registrado con el responsable.<br>' +
             '✅ Los cierres de turno se asociarán a esta persona.<br><br>' +
             '💡 Es obligatorio para poder cerrar el turno.<br><br>' +
             '📌 <b>Consejo:</b> Usa nombres completos para identificar fácilmente cada turno en el historial.'
    },
    // ==========================================
    // PASO 4: AGREGAR PRODUCTO
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '#btnAgregarProducto',
      titulo: '📦 Paso 3: Agrega tus Productos',
      texto: 'Haz clic en <b>"Agregar"</b> para añadir productos a tu cuadre.<br><br>' +
             'Cada producto tiene 4 campos:<br>' +
             '🔹 <b>Nombre</b> - Ej: Leche, Pan, Queso.<br>' +
             '🔹 <b>Precio</b> - Valor unitario del producto.<br>' +
             '🔹 <b>Inicial</b> - Cantidad al empezar el turno.<br>' +
             '🔹 <b>Final</b> - Cantidad al terminar el turno.<br><br>' +
             '💡 La diferencia (Inicial - Final) es lo que se vendió.<br><br>' +
             '📌 <b>Consejo:</b> Puedes agregar tantos productos como necesites.'
    },
    // ==========================================
    // PASO 5: CARGAR INVENTARIO
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '#btnCargarInventario',
      titulo: '📦 Paso 4: Cargar desde Inventario (Opcional)',
      texto: 'Si ya tienes productos guardados en tu <b>inventario</b>, puedes cargarlos con un solo clic.<br><br>' +
             '✅ <b>Más rápido</b> - No tienes que escribir cada producto.<br>' +
             '✅ <b>Menos errores</b> - Los precios y nombres ya están guardados.<br>' +
             '✅ <b>Consistencia</b> - Mantienes un inventario centralizado.<br><br>' +
             '💡 Puedes gestionar tu inventario desde la pestaña 📦 <b>Inventario</b>.<br><br>' +
             '📌 <b>Consejo:</b> Mantén tu inventario actualizado para agilizar los cuadres diarios.'
    },
    // ==========================================
    // PASO 6: BILLETES
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.tab-btn[data-tab="billetes"]',
      titulo: '💵 Paso 5: Cuenta tu Efectivo',
      texto: 'Ve a la pestaña <b>"Billetes"</b> para registrar el efectivo que tienes en tu caja.<br><br>' +
             '💲 <b>Billetes</b> - Ingresa la cantidad de cada denominación.<br>' +
             '📱 <b>Transferencias</b> - Monto recibido por medios electrónicos.<br><br>' +
             '✨ El sistema calcula automáticamente los subtotales y totales.<br><br>' +
             '📌 <b>Consejo:</b> Cuenta el efectivo con cuidado. Un error aquí puede afectar todo el cuadre.'
    },
    // ==========================================
    // PASO 7: COMPARADOR
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.comparador',
      titulo: '📊 Paso 6: Comparador en Tiempo Real',
      texto: 'Aquí puedes ver en <b>tiempo real</b> cómo va tu cuadre:<br><br>' +
             '💰 <b>Total a entregar</b> - Lo que deberías tener según tus ventas.<br>' +
             '💵 <b>Total en efectivo</b> - Lo que contaste en billetes.<br>' +
             '📱 <b>Transferencias</b> - Lo que recibiste por medios electrónicos.<br>' +
             '📌 <b>Diferencia</b> - Sobrante o faltante (si todo coincide, es 0).<br><br>' +
             '✅ Si la diferencia es 0, ¡tu cuadre es exacto!<br><br>' +
             '📌 <b>Consejo:</b> Revisa este panel constantemente para detectar errores a tiempo.'
    },
    // ==========================================
    // PASO 8: TOTAL
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.total',
      titulo: '💰 Paso 7: Total a Entregar',
      texto: 'Este es el <b>total que debes entregar</b> al final del turno según tus ventas.<br><br>' +
             '✅ Se actualiza automáticamente cuando cambias la cantidad de productos.<br>' +
             '✅ Si el total es correcto, el comparador mostrará "Cuadre exacto".<br><br>' +
             '💡 Es el valor que debes verificar con tu efectivo y transferencias.<br><br>' +
             '📌 <b>Consejo:</b> Asegúrate de que este total coincida con lo que tienes en la caja.'
    },
    // ==========================================
    // PASO 9: CERRAR TURNO
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.btn-cerrar',
      titulo: '🔒 Paso 8: Cerrar el Turno',
      texto: 'Cuando termines tu jornada, haz clic en <b>"CERRAR TURNO"</b>.<br><br>' +
             '✅ Guarda el turno en el historial.<br>' +
             '✅ Actualiza automáticamente el inventario (resta lo vendido).<br>' +
             '✅ Puedes enviar el resumen por <b>WhatsApp</b> con el botón "ENVIAR WHATSAPP".<br><br>' +
             '💡 ¡No olvides cerrar el turno! Es la única forma de guardar tu trabajo.<br><br>' +
             '📌 <b>Consejo:</b> Siempre cierra el turno antes de empezar uno nuevo.'
    },
    // ==========================================
    // PASO 10: NUEVO TURNO
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.btn-nuevo',
      titulo: '🔄 Paso 9: Empezar de Cero',
      texto: 'Cuando necesites <b>iniciar un nuevo turno</b>, haz clic en "NUEVO TURNO".<br><br>' +
             '🔄 <b>Reinicia todos los datos</b> - Limpia productos, billetes y transferencias.<br>' +
             '⚠️ <b>Precaución</b> - Si no has cerrado el turno actual, perderás los datos.<br><br>' +
             '💡 <b>Consejo:</b> Siempre cierra el turno antes de empezar uno nuevo para no perder información.'
    },
    // ==========================================
    // PASO 11: ENVIAR WHATSAPP (Cuadre)
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.btn-whatsapp',
      titulo: '📲 Paso 10: Enviar Reporte por WhatsApp',
      texto: 'Usa este botón para <b>compartir el reporte resumido</b> de tu cuadre por WhatsApp.<br><br>' +
             '📊 El reporte incluye:<br>' +
             '✅ Productos vendidos.<br>' +
             '✅ Total de ventas.<br>' +
             '✅ Efectivo contado.<br>' +
             '✅ Transferencias.<br>' +
             '✅ Diferencia (sobrante/faltante).<br><br>' +
             '💡 Es ideal para enviar a tu jefe, socio o equipo de trabajo.<br><br>' +
             '📌 <b>Consejo:</b> Usa esta función para mantener a todos informados del cierre del turno.'
    },
    // ==========================================
    // PASO 12: HISTORIAL
    // ==========================================
    {
      pagina: 'historial',
      selector: null,
      titulo: '📋 Paso 11: Revisa tu Historial',
      texto: 'En la pestaña <b>"📋 Historial"</b> puedes ver todos los turnos que has cerrado.<br><br>' +
             '📊 <b>Lista completa</b> - Todos los turnos ordenados por fecha.<br>' +
             '☀️🌙 <b>Filtros</b> - Puedes ver solo los turnos de Día o de Noche.<br>' +
             '🔍 <b>Detalle</b> - Haz clic en cualquier turno para ver su contenido completo.<br>' +
             '🗑️ <b>Eliminar</b> - Puedes eliminar turnos individuales o todos.<br><br>' +
             '💡 Aquí tienes el registro histórico de todo tu trabajo.<br><br>' +
             '📌 <b>Consejo:</b> Revisa el historial periódicamente para llevar un control de tus ventas.'
    },
    // ==========================================
    // PASO 13: INVENTARIO - EXPORTAR/IMPORTAR
    // ==========================================
    {
      pagina: 'inventario',
      selector: null,
      titulo: '📦 Paso 12: Gestiona tu Inventario',
      texto: 'En la pestaña <b>"📦 Inventario"</b> puedes gestionar todos tus productos.<br><br>' +
             '➕ <b>Agregar productos</b> - Nuevos productos con precio y stock.<br>' +
             '✏️ <b>Editar</b> - Modificar precios o cantidades existentes.<br>' +
             '🗑️ <b>Eliminar</b> - Remover productos que ya no uses.<br>' +
             '📲 <b>Exportar</b> - Envía el inventario completo por WhatsApp a tu equipo.<br>' +
             '📥 <b>Importar</b> - Pega el mensaje de WhatsApp que recibiste con el inventario.<br><br>' +
             '💡 <b>Flujo de trabajo:</b><br>' +
             '1️⃣ Persona 1 exporta el inventario y lo envía por WhatsApp.<br>' +
             '2️⃣ Persona 2 recibe el mensaje, lo copia y lo pega en "Importar".<br>' +
             '3️⃣ ¡El inventario se actualiza automáticamente!<br><br>' +
             '📌 <b>Consejo:</b> Mantén tu inventario actualizado para agilizar los cuadres diarios.'
    },
    // ==========================================
    // PASO 14: CONTACTAR DESARROLLADOR
    // ==========================================
    {
      pagina: 'cuadre',
      selector: '.btn-dev',
      titulo: '💬 Paso 13: ¿Necesitas Ayuda?',
      texto: 'Si tienes alguna duda, problema o quieres <b>adquirir la licencia</b>:<br><br>' +
             '📱 <b>Marco Asín</b> - Desarrollador de Cuadre de Negocio.<br>' +
             '💬 <b>WhatsApp</b>: [+53 5277 6644](https://wa.me/5352776644)<br><br>' +
             '🎯 <b>Renovación de licencia</b> - Después de tus 3 días gratis.<br>' +
             '❓ <b>Soporte técnico</b> - Cualquier problema o duda.<br><br>' +
             '💡 <b>¡No dudes en contactarme!</b> Estoy aquí para ayudarte.'
    }
  ];
}

// =============================================
// ESTILOS CSS
// =============================================

function agregarEstilosTutorial() {
  if (document.getElementById('tutStyles')) return;
  
  var style = document.createElement('style');
  style.id = 'tutStyles';
  style.textContent = `
    .tut-resaltado {
      position: relative !important;
      z-index: 999999 !important;
      outline: 3px solid #1a237e !important;
      outline-offset: 6px !important;
      box-shadow: 0 0 15px rgba(26, 35, 126, 0.25) !important;
      animation: tutPulso 1.8s ease-in-out infinite !important;
    }
    
    @keyframes tutPulso {
      0%, 100% {
        outline-color: #1a237e;
        box-shadow: 0 0 15px rgba(26, 35, 126, 0.25);
      }
      50% {
        outline-color: #0d47a1;
        box-shadow: 0 0 25px rgba(26, 35, 126, 0.4);
      }
    }
  `;
  document.head.appendChild(style);
}

// =============================================
// LIMPIEZA
// =============================================

function limpiar() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  
  var overlay = document.getElementById('tutOverlay');
  if (overlay) overlay.remove();
  
  var tooltip = document.getElementById('tutTooltip');
  if (tooltip) tooltip.remove();
  
  var elementos = document.querySelectorAll('.tut-resaltado');
  for (var i = 0; i < elementos.length; i++) {
    var el = elementos[i];
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
    el.style.position = '';
    el.style.zIndex = '';
    el.style.animation = '';
    el.classList.remove('tut-resaltado');
  }
}

function finalizar() {
  limpiar();
  marcarTutorialVisto();
}

// =============================================
// MOSTRAR PASO
// =============================================

function mostrarPaso() {
  limpiar();
  
  var paso = pasos[pasoActual];
  if (!paso) {
    finalizar();
    return;
  }

  var target = null;
  if (paso.selector) {
    target = document.querySelector(paso.selector);
    if (!target && paso.selector === '.comparador') {
      target = document.querySelector('#comparador');
    }
  }

  var overlay = document.createElement('div');
  overlay.id = 'tutOverlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:999998;pointer-events:none;';
  document.body.appendChild(overlay);

  if (target) {
    target.classList.add('tut-resaltado');
    try {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {}
  }

  var esUltimo = pasoActual === pasos.length - 1;
  
  var tooltip = document.createElement('div');
  tooltip.id = 'tutTooltip';
  tooltip.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:white;border-radius:16px;padding:20px 24px;max-width:400px;width:calc(100% - 40px);z-index:9999999;box-shadow:0 10px 40px rgba(0,0,0,0.3);pointer-events:auto;';

  tooltip.innerHTML = 
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:12px;font-weight:700;color:#f57c00;background:#fff3e0;padding:2px 12px;border-radius:20px;">PASO ' + (pasoActual + 1) + '/' + pasos.length + '</span>' +
      (pasoActual > 0 ? '<button id="tutAtras" style="background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:0 8px;">←</button>' : '') +
    '</div>' +
    '<div style="font-size:18px;font-weight:700;color:#1a237e;margin-bottom:4px;">' + paso.titulo + '</div>' +
    '<div style="font-size:14px;color:#444;line-height:1.6;margin-bottom:16px;">' + paso.texto + '</div>' +
    '<div style="display:flex;gap:10px;">' +
      '<button id="tutSaltar" style="flex:1;padding:10px;background:#f0f0f0;border:none;border-radius:10px;font-weight:600;font-size:13px;cursor:pointer;">Saltar</button>' +
      '<button id="tutSiguiente" style="flex:2;padding:10px;background:#1a237e;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">' + (esUltimo ? '✅ Entendido' : 'Siguiente →') + '</button>' +
    '</div>';

  document.body.appendChild(tooltip);

  document.getElementById('tutSaltar').addEventListener('click', finalizar);
  document.getElementById('tutSiguiente').addEventListener('click', function() {
    if (esUltimo) {
      finalizar();
    } else {
      avanzar();
    }
  });
  
  var atras = document.getElementById('tutAtras');
  if (atras) {
    atras.addEventListener('click', retroceder);
  }

  if (target && !esUltimo) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        avanzar();
      }
    });
  }
}

// =============================================
// NAVEGACIÓN
// =============================================

function prepararPaso() {
  var paso = pasos[pasoActual];
  if (!paso) {
    finalizar();
    return;
  }

  var elementos = document.querySelectorAll('.tut-resaltado');
  for (var i = 0; i < elementos.length; i++) {
    var el = elementos[i];
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.boxShadow = '';
    el.style.position = '';
    el.style.zIndex = '';
    el.style.animation = '';
    el.classList.remove('tut-resaltado');
  }

  if (paso.pagina && paso.pagina !== paginaActual) {
    paginaActual = paso.pagina;
    if (typeof opciones.onCambiarPagina === 'function') {
      opciones.onCambiarPagina(paso.pagina);
    }
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      timeoutId = null;
      mostrarPaso();
    }, 500);
  } else {
    mostrarPaso();
  }
}

function avanzar() {
  if (pasoActual < pasos.length - 1) {
    pasoActual++;
    prepararPaso();
  } else {
    finalizar();
  }
}

function retroceder() {
  if (pasoActual > 0) {
    pasoActual--;
    prepararPaso();
  }
}

// =============================================
// API PÚBLICA
// =============================================

export function iniciarTutorial(opts) {
  if (tutorialYaVisto()) return;
  
  pasos = obtenerPasos();
  pasoActual = 0;
  opciones = opts || {};
  paginaActual = null;
  
  agregarEstilosTutorial();
  prepararPaso();
}

export function detenerTutorial() {
  limpiar();
}

export function reiniciarTutorial() {
  resetearTutorial();
  iniciarTutorial();
}