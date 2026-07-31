// src/core/services/licenciaService.js
// Sistema de licencias

const _0x1a2b = 3;
const _0x3c4d = 30;
const _0x5e6f = 'fecha_instalacion';
const _0x7g8h = 'licencia_activa';
const _0x9i0j = 'fecha_activacion';
const _0x1k2l = 'c350a99d1c0332f5abee4b94b6d7b255bfa0050d4c9f4169221c8d0754596e48';

// Protección contra fuerza bruta: cuenta intentos fallidos y aplica un
// bloqueo temporal cada vez más largo. No cambia la contraseña, solo
// hace que probar contraseñas al azar sea impráctico.
const _0xm3n4 = 'lic_intentos_fallidos';
const _0xo5p6 = 'lic_bloqueado_hasta';
const _0xq7r8 = 5; // intentos libres antes de empezar a bloquear

function _tiempoBloqueoRestanteMs() {
  var hasta = localStorage.getItem(_0xo5p6);
  if (!hasta) return 0;
  var restante = new Date(hasta).getTime() - Date.now();
  return restante > 0 ? restante : 0;
}

export function intentoBloqueadoPorSeguridad() {
  return _tiempoBloqueoRestanteMs() > 0;
}

export function minutosDeBloqueoRestantes() {
  return Math.ceil(_tiempoBloqueoRestanteMs() / 60000);
}

function _0x1() {
  var a = localStorage.getItem(_0x5e6f);
  if (!a) {
    a = new Date().toISOString();
    localStorage.setItem(_0x5e6f, a);
  }
  return new Date(a);
}

function _0x2(a) {
  var b = new Date();
  var c = b.getTime() - a.getTime();
  return Math.floor(c / (1000 * 60 * 60 * 24));
}

async function _0x3(a) {
  var b = new TextEncoder();
  var c = b.encode(a);
  var d = await crypto.subtle.digest('SHA-256', c);
  var e = Array.from(new Uint8Array(d));
  var f = e.map(function(g) {
    return g.toString(16).padStart(2, '0');
  }).join('');
  return f;
}

export function verificarContrasena(a) {
  if (intentoBloqueadoPorSeguridad()) {
    return Promise.resolve(false);
  }
  return _0x3(a).then(function(b) {
    var correcta = b === _0x1k2l;
    if (correcta) {
      localStorage.removeItem(_0xm3n4);
      localStorage.removeItem(_0xo5p6);
    } else {
      var intentos = parseInt(localStorage.getItem(_0xm3n4) || '0', 10) + 1;
      localStorage.setItem(_0xm3n4, String(intentos));
      if (intentos >= _0xq7r8) {
        // Backoff exponencial: 5°→2min, 6°→4min, 7°→8min... tope 24h
        var minutos = Math.min(2 * Math.pow(2, intentos - _0xq7r8), 1440);
        var hasta = new Date(Date.now() + minutos * 60000).toISOString();
        localStorage.setItem(_0xo5p6, hasta);
      }
    }
    return correcta;
  });
}

export function obtenerEstadoLicencia() {
  var a = localStorage.getItem(_0x7g8h) === 'true';
  var b = localStorage.getItem(_0x9i0j);
  
  if (a && b) {
    var c = new Date(b);
    var d = _0x2(c);
    
    if (d < _0x3c4d) {
      return {
        estado: 'activada',
        diasRestantes: _0x3c4d - d,
        mensaje: 'Licencia activa: ' + (_0x3c4d - d) + ' días restantes'
      };
    } else {
      localStorage.removeItem(_0x7g8h);
      localStorage.removeItem(_0x9i0j);
      return {
        estado: 'bloqueado',
        diasRestantes: 0,
        mensaje: 'Tu licencia ha expirado. Contacta al desarrollador.'
      };
    }
  }
  
  var e = _0x1();
  var f = _0x2(e);
  
  if (f < _0x1a2b) {
    return {
      estado: 'prueba',
      diasRestantes: _0x1a2b - f,
      mensaje: '🔓 Periodo de prueba: ' + (_0x1a2b - f) + ' días restantes'
    };
  }
  
  return {
    estado: 'bloqueado',
    diasRestantes: 0,
    mensaje: 'Tu periodo de prueba ha terminado. Ingresa la contraseña.'
  };
}

export function appBloqueada() {
  var a = obtenerEstadoLicencia();
  return a.estado === 'bloqueado';
}

export function obtenerTextoContador() {
  var a = obtenerEstadoLicencia();
  
  if (a.estado === 'activada') {
    return '✅ ' + a.diasRestantes + 'd';
  } else if (a.estado === 'prueba') {
    return '🔓 ' + a.diasRestantes + 'd gratis';
  } else {
    return '🔒 Bloqueada';
  }
}

export function obtenerMensajeLicencia() {
  var a = obtenerEstadoLicencia();
  return a.mensaje || '';
}

export function activarLicencia() {
  var a = new Date().toISOString();
  localStorage.setItem(_0x7g8h, 'true');
  localStorage.setItem(_0x9i0j, a);
  console.log('✅ Licencia activada por 30 días');
}

export function reiniciarLicencia() {
  localStorage.removeItem(_0x5e6f);
  localStorage.removeItem(_0x7g8h);
  localStorage.removeItem(_0x9i0j);
  console.log('🔄 Licencia reiniciada');
}