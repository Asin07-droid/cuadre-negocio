// app.js - Punto de entrada principal

import { abrirDB } from './src/infrastructure/indexeddb/db.js';
import { 
  obtenerEstadoLicencia, 
  appBloqueada, 
  obtenerTextoContador, 
  obtenerMensajeLicencia, 
  verificarContrasena, 
  activarLicencia,
  reiniciarLicencia
} from './licenciaService.js';
import { iniciarTutorial, tutorialYaVisto } from './tutorialService.js';
import { renderCuadrePage } from './CuadrePage.js';
import { renderHistorialPage } from './HistorialPage.js';
import { renderInventarioPage } from './InventarioPage.js';

// ============================================
// SPLASH SCREEN
// ============================================

function mostrarSplash() {
  const existing = document.getElementById('splash');
  if (existing) existing.remove();

  const splash = document.createElement('div');
  splash.id = 'splash';
  splash.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
  `;
  
  splash.innerHTML = `
    <div style="width: 130px; height: 130px; border-radius: 50%; border: 4px solid #1a237e; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: #f0f0f0;">
      <img src="logo-tecnoroutev.png" alt="TecnoRouteV" 
           style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover;">
    </div>
    <h1 style="color: #1a237e; font-size: 24px; font-weight: 700; margin: 0;">Cuadre de Negocio</h1>
    <p style="color: #1a237e; font-size: 14px; margin-top: 4px; opacity: 0.7;">Versión 1.5</p>
    <div style="margin-top: 24px; width: 36px; height: 36px; border: 4px solid #e0e0e0; border-top-color: #1a237e; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
  `;
  
  document.body.appendChild(splash);
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

function ocultarSplash() {
  const splash = document.getElementById('splash');
  if (splash) {
    splash.style.transition = 'opacity 0.3s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
    }, 300);
  }
}

// ============================================
// ESTILOS DE TRANSICIÓN
// ============================================

function agregarEstilosSwipe() {
  const style = document.createElement('style');
  style.textContent = `
    #app-content {
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: opacity, transform;
      opacity: 1;
      transform: translateX(0);
    }
    
    @keyframes slideInLeft {
      from { opacity: 0.5; transform: translateX(25px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideInRight {
      from { opacity: 0.5; transform: translateX(-25px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .page-enter-left { animation: slideInLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .page-enter-right { animation: slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    #app-content:not(.page-enter-left):not(.page-enter-right) {
      opacity: 1;
      transform: translateX(0);
    }
    
    .nav-item {
      transition: all 0.15s ease;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    .nav-item:active { transform: scale(0.95); }
    .nav-item.active { color: #1a237e; font-weight: 600; }
    .nav-item.active::after {
      content: '';
      display: block;
      width: 20px;
      height: 2px;
      background: #1a237e;
      margin: 2px auto 0;
      border-radius: 2px;
      animation: fadeInDot 0.2s ease;
    }
    @keyframes fadeInDot {
      from { width: 0; opacity: 0; }
      to { width: 20px; opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// NAVEGACIÓN
// ============================================

const paginas = { 
  cuadre: renderCuadrePage, 
  historial: renderHistorialPage, 
  inventario: renderInventarioPage 
};

const ordenPaginas = ['cuadre', 'historial', 'inventario'];
let paginaActual = 'cuadre';
let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
let isSwiping = false, isTransitioning = false;

function esElementoInteractivo(target) {
  const selectores = ['input','button','select','textarea','a','[role="button"]','[role="tab"]',
    '.btn-action','.btn-primary','.btn-turno','.tab-btn','.btn-eliminar','.btn-editar',
    '.btn-ver-detalle','.btn-eliminar-turno','.btn-filtro','.nav-item',
    '.producto-row input','.billete-row input','.transferencia-row input',
    '.turno-card','.turno-card *','.comparador','.comparador *',
    '.total','.total *','.tabs-header','.tabs-header *',
    '.tabs-track','.tabs-track *','.acciones-grid','.acciones-grid *'];
  let current = target;
  while (current && current !== document.body && current !== document.documentElement) {
    for (var i = 0; i < selectores.length; i++) {
      try { if (current.matches && current.matches(selectores[i])) return true; } catch(e) {}
    }
    current = current.parentElement;
  }
  return false;
}

function navegarA(pagina, direccion, esTutorial) {
  if (!paginas[pagina]) return;
  if (appBloqueada()) { mostrarPantallaBloqueo(); return; }
  if (isTransitioning) return;
  if (pagina === paginaActual && !esTutorial) return;
  isTransitioning = true;
  var container = document.getElementById('app-content');
  var enterClass = direccion === 'left' ? 'page-enter-left' : 'page-enter-right';
  paginaActual = pagina;
  paginas[pagina]();
  document.querySelectorAll('.nav-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.page === pagina);
  });
  void container.offsetHeight;
  container.classList.add(enterClass);
  setTimeout(function() {
    container.classList.remove(enterClass);
    isTransitioning = false;
  }, 250);
}

window.navegarA = navegarA;

// ============================================
// SWIPE
// ============================================

function setupSwipe() {
  var appContent = document.getElementById('app-content');
  if (!appContent) return;

  appContent.addEventListener('touchstart', function(e) {
    if (esElementoInteractivo(e.target)) { isSwiping = false; return; }
    if (isTransitioning) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isSwiping = true;
  }, { passive: true });

  appContent.addEventListener('touchmove', function(e) {
    if (!isSwiping || isTransitioning) return;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    var diffX = touchStartX - touchEndX;
    var diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 15) {
      e.preventDefault();
    }
  }, { passive: false });

  appContent.addEventListener('touchend', function(e) {
    if (!isSwiping || isTransitioning) { isSwiping = false; return; }
    isSwiping = false;
    var diffX = touchStartX - touchEndX;
    var diffY = touchStartY - touchEndY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 70) {
      if (diffX > 0) { cambiarPagina(1); } else { cambiarPagina(-1); }
    }
  }, { passive: true });

  var mouseDown = false, mouseStartX = 0, mouseEndX = 0;
  appContent.addEventListener('mousedown', function(e) {
    if (esElementoInteractivo(e.target)) { mouseDown = false; return; }
    if (e.button === 0 && !isTransitioning) { mouseDown = true; mouseStartX = e.screenX; }
  });
  appContent.addEventListener('mousemove', function(e) {
    if (!mouseDown || isTransitioning) return;
    mouseEndX = e.screenX;
  });
  appContent.addEventListener('mouseup', function(e) {
    if (!mouseDown || isTransitioning) { mouseDown = false; return; }
    mouseDown = false;
    var diffX = mouseStartX - mouseEndX;
    if (Math.abs(diffX) > 70) {
      if (diffX > 0) { cambiarPagina(1); } else { cambiarPagina(-1); }
    }
  });
  appContent.addEventListener('mouseleave', function() { mouseDown = false; });
}

function cambiarPagina(direccion) {
  var indexActual = ordenPaginas.indexOf(paginaActual);
  var nuevoIndex = indexActual + direccion;
  if (nuevoIndex < 0) nuevoIndex = ordenPaginas.length - 1;
  if (nuevoIndex >= ordenPaginas.length) nuevoIndex = 0;
  var direccionSwipe = direccion > 0 ? 'left' : 'right';
  navegarA(ordenPaginas[nuevoIndex], direccionSwipe);
}

// ============================================
// PANTALLA DE BLOQUEO
// ============================================

function mostrarPantallaBloqueo() {
  var container = document.getElementById('app-content');
  var estado = obtenerEstadoLicencia();
  
  var nav = document.getElementById('mainNav');
  if (nav) nav.style.display = 'none';
  
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 20px; max-width: 400px; margin: 0 auto;">
      <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #1a237e; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; background: #f0f0f0;">
        <img src="logo-tecnoroutev.png" alt="TecnoRouteV" style="width: 75px; height: 75px; border-radius: 50%; object-fit: cover;">
      </div>
      <h1 style="color: #1a237e; font-size: 24px; margin-bottom: 8px; text-align: center;">App Bloqueada</h1>
      <p style="color: #666; text-align: center; margin-bottom: 24px; font-size: 15px;">
        ${estado.mensaje || 'Tu periodo de prueba ha terminado. Ingresa la contraseña de verificación para continuar.'}
      </p>
      <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; width: 100%; text-align: center;">
        <span style="font-size: 13px; color: #666;">📅 Periodo de prueba: 3 días</span>
      </div>
      <div style="width: 100%;">
        <label style="display: block; font-size: 13px; color: #666; margin-bottom: 6px;">Contraseña de verificación</label>
        <input type="password" id="inputLicencia" placeholder="Ingresa la contraseña" style="width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; margin-bottom: 12px; min-height: 48px;">
        <button id="btnVerificarLicencia" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #1a237e, #0d47a1); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 16px; cursor: pointer; min-height: 48px;">
          🔑 Verificar
        </button>
        <div id="errorLicencia" style="color: #dc2626; font-size: 13px; min-height: 20px; margin-top: 8px;"></div>
      </div>
      <div style="margin-top: 20px; width: 100%;">
        <button id="btnContactarDesarrollador" style="width: 100%; padding: 14px; background: #25D366; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; min-height: 48px;">
          💬 Contactar desarrollador
        </button>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">
        <p style="margin: 0;">¿Problemas? Contacta al desarrollador para renovar tu licencia.</p>
      </div>
    </div>
  `;
  
  document.getElementById('btnVerificarLicencia').addEventListener('click', async function() {
    var input = document.getElementById('inputLicencia');
    var error = document.getElementById('errorLicencia');
    var contrasena = input.value.trim();
    
    if (!contrasena) {
      error.textContent = '❌ Ingresa la contraseña.';
      return;
    }
    
    try {
      var valida = await verificarContrasena(contrasena);
      
      if (valida) {
        activarLicencia();
        error.textContent = '';
        input.value = '';
        location.reload();
      } else {
        error.textContent = '❌ Contraseña incorrecta. Intenta de nuevo.';
        input.value = '';
        input.focus();
      }
    } catch (e) {
      error.textContent = '❌ Error al verificar. Intenta de nuevo.';
      console.error(e);
    }
  });
  
  document.getElementById('inputLicencia').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('btnVerificarLicencia').click();
    }
  });
  
  document.getElementById('btnContactarDesarrollador').addEventListener('click', function() {
    window.open('https://wa.me/5352776644?text=Hola%2C%20necesito%20renovar%20mi%20licencia%20de%20Cuadre%20de%20Negocio.', '_blank');
  });
}

// ============================================
// ACTUALIZAR HEADER
// ============================================

function actualizarHeader() {
  var estado = obtenerEstadoLicencia();
  var contador = obtenerTextoContador();
  var headerContador = document.getElementById('licenciaContador');
  if (!headerContador) {
    var header = document.querySelector('.app-header');
    if (header) {
      headerContador = document.createElement('div');
      headerContador.id = 'licenciaContador';
      headerContador.style.cssText = 'font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;background:' + (estado.estado === 'prueba' ? '#fff3e0' : '#e8f5e9') + ';color:' + (estado.estado === 'prueba' ? '#e65100' : '#2e7d32') + ';border:1px solid ' + (estado.estado === 'prueba' ? '#ffcc80' : '#a5d6a7') + ';margin-left:auto;white-space:nowrap;transition:all 0.3s ease;';
      header.appendChild(headerContador);
    }
  }
  if (headerContador) {
    headerContador.textContent = contador;
    headerContador.style.background = estado.estado === 'prueba' ? '#fff3e0' : '#e8f5e9';
    headerContador.style.color = estado.estado === 'prueba' ? '#e65100' : '#2e7d32';
    headerContador.style.border = '1px solid ' + (estado.estado === 'prueba' ? '#ffcc80' : '#a5d6a7');
  }
}

// ============================================
// INICIALIZAR APP
// ============================================

async function initApp() {
  console.log('🚀 Iniciando Cuadre de Negocio V1.5');
  
  agregarEstilosSwipe();
  mostrarSplash();
  
  await new Promise(function(resolve) { setTimeout(resolve, 2000); });
  ocultarSplash();
  
  var estado = obtenerEstadoLicencia();
  console.log('📋 Estado de licencia:', estado.estado);
  console.log('📅 Días restantes:', estado.diasRestantes);
  
  try {
    await abrirDB();
    console.log('✅ Base de datos conectada');
    
    if (appBloqueada()) {
      console.log('🔒 App bloqueada, mostrando pantalla de autenticación');
      mostrarPantallaBloqueo();
      return;
    }
    
    console.log('✅ App no bloqueada, cargando interfaz...');
    
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var page = this.dataset.page;
        if (page && page !== paginaActual) {
          var direccion = ordenPaginas.indexOf(page) > ordenPaginas.indexOf(paginaActual) ? 'left' : 'right';
          navegarA(page, direccion);
        }
      });
    });
    
    var container = document.getElementById('app-content');
    paginaActual = 'cuadre';
    paginas.cuadre();
    
    document.querySelectorAll('.nav-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.page === 'cuadre');
    });
    
    container.style.opacity = '1';
    container.style.transform = 'translateX(0)';
    
    actualizarHeader();
    
    setTimeout(function() {
      setupSwipe();
      console.log('👆 Swipe activado');
    }, 100);
    
    setTimeout(function() {
      console.log('🔍 Revisando si mostrar tutorial...');
      console.log('📌 tutorialYaVisto():', tutorialYaVisto());
      
      if (!tutorialYaVisto()) {
        console.log('🎓 Iniciando tutorial guiado...');
        iniciarTutorial({
          onCambiarPagina: function(pagina) {
            console.log('📄 Cambiando a página:', pagina);
            navegarA(pagina, 'left', true);
          }
        });
      } else {
        console.log('✅ Tutorial ya visto, omitiendo...');
      }
    }, 2000);
    
    console.log('✅ App inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    var container = document.getElementById('app-content');
    container.innerHTML = `
      <div style="padding:40px 20px;text-align:center;color:#dc2626;">
        <h2>Error al iniciar la aplicación</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()" style="padding:10px 20px;background:#1a237e;color:white;border:none;border-radius:8px;margin-top:20px;">Reintentar</button>
      </div>
    `;
  }
}

// ============================================
// EJECUTAR
// ============================================

document.addEventListener('DOMContentLoaded', initApp);

window.licencia = {
  obtenerEstado: obtenerEstadoLicencia,
  verificarContrasena: verificarContrasena,
  activarLicencia: activarLicencia,
  appBloqueada: appBloqueada,
  reiniciarLicencia: reiniciarLicencia
};

window.navegarA = navegarA;
window.reiniciarLicencia = reiniciarLicencia;

console.log('✅ app.js cargado correctamente');

// ============================================
// REGISTRAR SERVICE WORKER (OFFLINE)
// ============================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js', { scope: '/' })
      .then(function(registration) {
        console.log('✅ Service Worker registrado correctamente');
        console.log('📌 Scope:', registration.scope);
      })
      .catch(function(error) {
        console.log('❌ Error al registrar Service Worker:', error);
      });
  });
}

// ============================================
// KEEP ALIVE - MANTENER SERVICE WORKER ACTIVO
// ============================================

if ('serviceWorker' in navigator) {
  // Mantener el Service Worker activo enviando un "ping" cada 30 segundos
  setInterval(function() {
    navigator.serviceWorker.ready.then(function(registration) {
      if (registration.active) {
        registration.active.postMessage({ type: 'KEEP_ALIVE' });
        console.log('💓 Ping al Service Worker');
      }
    }).catch(function() {
      // Ignorar errores
    });
  }, 30000); // Cada 30 segundos
}

// ============================================
// RECUPERAR OFFLINE - SI EL SW SE DETIENE
// ============================================

// Si el Service Worker se detiene, la app intentará registrarlo de nuevo
if ('serviceWorker' in navigator) {
  // Verificar cada 10 segundos si el SW sigue activo
  setInterval(function() {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      if (!registration || !registration.active) {
        console.log('🔄 Service Worker no activo, registrando de nuevo...');
        navigator.serviceWorker.register('sw.js', { scope: '/' })
          .then(function() {
            console.log('✅ Service Worker registrado nuevamente');
          })
          .catch(function(error) {
            console.log('❌ Error al registrar Service Worker:', error);
          });
      }
    }).catch(function() {
      // Ignorar errores
    });
  }, 10000); // Cada 10 segundos
}