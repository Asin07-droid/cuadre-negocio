// CuadrePage.js

import { DENOMINACIONES } from './src/shared/constants/denominaciones.js';
import { guardarTurno } from './src/infrastructure/indexeddb/turnosRepository.js';
import { obtenerProductos, actualizarProducto } from './src/infrastructure/indexeddb/productosRepository.js';
import { obtenerTextoContador } from './licenciaService.js';
import {
  notificacionExito,
  notificacionError,
  notificacionInfo,
  notificacionAdvertencia,
  notificacionTurnoCerrado,
  notificacionTurnoError,
  notificacionWhatsAppEnviado,
  notificacionProductoCargado,
  notificacionNuevoTurno,
  notificacionSinProductos
} from './notificacionService.js';

// =============================================
// ESTADO LOCAL
// =============================================

let productosCuadre = [];
let billetes = {};
let transferencia = 0;
let turnoActual = localStorage.getItem('turno_actual') || 'Día';
let contador = 0;
let productosInventario = [];

// =============================================
// FUNCIÓN PRINCIPAL
// =============================================

export async function renderCuadrePage() {
  const container = document.getElementById('app-content');
  
  try {
    productosInventario = await obtenerProductos();
    console.log('📦 Productos en inventario:', productosInventario.length);
  } catch (error) {
    console.error('Error al cargar inventario:', error);
    productosInventario = [];
  }

  DENOMINACIONES.forEach(den => {
    if (billetes[den.id] === undefined) {
      billetes[den.id] = 0;
    }
  });

  // ============================================
  // CONTADOR DINÁMICO
  // ============================================
  const contadorLicencia = obtenerTextoContador();

  container.innerHTML = `
    <div style="padding: 10px; max-width: 500px; margin: 0 auto;">
      
      <!-- HEADER CON LOGO -->
      <div class="app-header">
        <img src="logo-tecnoroutev.png" alt="TecnoRouteV" class="logo">
        <div class="title-group">
          <div class="title">Cuadre de Negocio</div>
          <div class="sub">Versión 1.5</div>
        </div>
        <div class="licencia-contador" id="licenciaContadorHeader">${contadorLicencia}</div>
      </div>

      <!-- TÍTULO Y TURNO -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h1 style="color: #16213E; font-size: 20px; margin: 0;">📊 Cuadre Diario</h1>
        <div class="turno-selector">
          <button class="btn-turno ${turnoActual === 'Día' ? 'active' : ''}" data-turno="Día">☀️ Día</button>
          <button class="btn-turno ${turnoActual === 'Noche' ? 'active' : ''}" data-turno="Noche">🌙 Noche</button>
        </div>
      </div>

      <!-- DEPENDIENTE -->
      <input class="input-field" id="dependiente" placeholder="Nombre del Dependiente">

      <!-- PESTAÑAS INTERNAS -->
      <div class="tabs-wrapper" id="tabsWrapper">
        <div class="tabs-header" id="tabsHeader">
          <button class="tab-btn active" data-tab="productos">📦 Productos</button>
          <button class="tab-btn" data-tab="billetes">💵 Billetes</button>
        </div>
        <div class="tabs-track" id="tabsTrack">
          <div class="tab-pane" id="paneProductos">
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
              <button id="btnCargarInventario" class="btn-primary" style="flex: 1; padding: 10px; font-size: 13px; min-height: 40px; background: #1F6E43;">📦 Cargar del Inventario</button>
              <button id="btnAgregarProducto" class="btn-primary" style="flex: 1; padding: 10px; font-size: 13px; min-height: 40px;">➕ Agregar</button>
            </div>
            <div id="productos-container"></div>
          </div>
          <div class="tab-pane" id="paneBilletes" style="display: none;">
            <div id="billetes-container"></div>
          </div>
        </div>
      </div>

      <!-- TOTAL -->
      <div class="total" id="total">Total a entregar: $0</div>

      <!-- COMPARADOR -->
      <div class="comparador" id="comparador">
        <div class="fila"><span class="label">📊 Total a entregar</span><span class="valor" id="compTotalVentas">$0</span></div>
        <div class="fila"><span class="label">💰 Total en efectivo</span><span class="valor" id="compTotalEfectivo">$0</span></div>
        <div class="fila"><span class="label">📱 Total en transferencias</span><span class="valor" id="compTotalTransferencia">$0</span></div>
        <div class="fila" style="font-weight: 700; border-top: 2px solid #16213E; padding-top: 6px;">
          <span class="label">💳 Total recibido</span>
          <span class="valor" style="color: #16213E;" id="compTotalGeneral">$0</span>
        </div>
        <div class="fila" style="font-weight: 700;">
          <span class="label">📌 Diferencia</span>
          <span class="valor" id="compDiferencia">$0</span>
        </div>
        <div class="resultado exacto" id="compResultado">
          <span>✅</span>
          <span>Cuadre exacto</span>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="acciones-grid">
        <button class="btn-action btn-cerrar" onclick="window.cerrarTurno()">
          <span class="icon">🔒</span>
          <span class="label">CERRAR TURNO</span>
          <span class="sub">Guardar y finalizar</span>
        </button>
        <button class="btn-action btn-nuevo" onclick="window.nuevoTurno()">
          <span class="icon">🔄</span>
          <span class="label">NUEVO TURNO</span>
          <span class="sub">Empezar desde cero</span>
        </button>
        <button class="btn-action btn-whatsapp" onclick="window.enviarWhatsApp()">
          <span class="icon">📲</span>
          <span class="label">ENVIAR WHATSAPP</span>
          <span class="sub">Reporte resumido</span>
        </button>
        <button class="btn-action btn-dev" onclick="window.contactarDesarrollador()">
          <span class="icon">💬</span>
          <span class="label">CONTACTAR DESARROLLADOR</span>
          <span class="sub">Soporte y renovación</span>
        </button>
      </div>
    </div>
  `;

  // ============================================
  // EVENTOS
  // ============================================

  document.querySelectorAll('.btn-turno').forEach(btn => {
    btn.addEventListener('click', function() {
      turnoActual = this.dataset.turno;
      localStorage.setItem('turno_actual', turnoActual);
      document.querySelectorAll('.btn-turno').forEach(b => {
        b.classList.toggle('active', b === this);
      });
    });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
      });
      this.classList.add('active');
      
      document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
      document.getElementById('pane' + tab.charAt(0).toUpperCase() + tab.slice(1)).style.display = 'block';
    });
  });

  document.getElementById('btnAgregarProducto').addEventListener('click', () => {
    window.agregarProducto('', '', '', '');
  });

  document.getElementById('btnCargarInventario').addEventListener('click', () => {
    window.cargarDesdeInventario();
  });

  renderBilletes();
  cargarEstado();
  calcularTotal();
  calcularTotalBilletes();
}

// ============================================
// FUNCIONES EXPUESTAS GLOBALMENTE
// ============================================

window.agregarProducto = function(nombre = '', precio = '', inicial = '', final = '') {
  const container = document.getElementById('productos-container');
  const row = document.createElement('div');
  row.className = 'producto-row';
  row.id = 'prod-' + contador;
  
  row.innerHTML = `
    <div class="campo">
      <label>Producto</label>
      <input class="prod-nombre" placeholder="Ej: Leche" value="${nombre}">
    </div>
    <div class="campo">
      <label>Precio</label>
      <input class="prod-precio" type="number" placeholder="0" value="${precio}">
    </div>
    <div class="campo">
      <label>Inicial</label>
      <input class="prod-inicial" type="number" placeholder="0" value="${inicial}">
    </div>
    <div class="campo">
      <label>Final</label>
      <input class="prod-final" type="number" placeholder="0" value="${final}">
    </div>
    <button class="btn-eliminar" onclick="window.eliminarProducto('${row.id}')">✖</button>
  `;
  
  container.appendChild(row);
  contador++;
  
  row.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', function() {
      calcularTotal();
      guardarEstado();
    });
  });
  
  calcularTotal();
  guardarEstado();
};

window.eliminarProducto = function(id) {
  const row = document.getElementById(id);
  if (row) {
    row.remove();
    calcularTotal();
    guardarEstado();
  }
};

window.cargarDesdeInventario = function() {
  if (productosInventario.length === 0) {
    notificacionSinProductos();
    return;
  }

  document.getElementById('productos-container').innerHTML = '';
  contador = 0;

  productosInventario.forEach(p => {
    window.agregarProducto(p.nombre, p.precio, p.stock || 0, p.stock || 0);
  });

  notificacionProductoCargado(productosInventario.length);
  calcularTotal();
  guardarEstado();
};

// ============================================
// ENVIAR WHATSAPP
// ============================================

window.enviarWhatsApp = function() {
  const dependiente = document.getElementById('dependiente').value.trim();
  if (!dependiente) {
    notificacionError('❌ Ingresa el nombre del dependiente o turno.');
    return;
  }

  notificacionWhatsAppEnviado();

  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-CU') + ' ' + fecha.toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });
  
  let reporte = `📊 *REPORTE DE CUADRE DIARIO*\n`;
  reporte += `👤 *Dependiente:* ${dependiente.toUpperCase()}\n`;
  reporte += `🕐 *Turno:* ${turnoActual}\n`;
  reporte += `📅 *Fecha/Hora:* ${fechaStr}\n`;
  reporte += `═══════════════════════════════\n\n`;

  reporte += `🛍️ *PRODUCTOS VENDIDOS*\n`;
  let totalVentas = 0;
  let hayVentas = false;
  const rows = document.querySelectorAll('.producto-row');

  rows.forEach(row => {
    const nombre = row.querySelector('.prod-nombre').value.trim();
    const precio = parseInt(row.querySelector('.prod-precio').value) || 0;
    const inicial = parseInt(row.querySelector('.prod-inicial').value) || 0;
    const final = parseInt(row.querySelector('.prod-final').value) || 0;
    const vendido = inicial - final;
    if (vendido > 0 && nombre) {
      hayVentas = true;
      const subtotal = vendido * precio;
      totalVentas += subtotal;
      reporte += `  • ${nombre}: ${vendido} x $${precio} = $${subtotal}\n`;
    }
  });

  if (!hayVentas) {
    reporte += `  No se registraron ventas\n`;
  }
  reporte += `\n💰 *TOTAL VENTAS: $${totalVentas}*\n\n`;

  reporte += `📦 *INVENTARIO FINAL*\n`;
  let hayInventario = false;
  rows.forEach(row => {
    const nombre = row.querySelector('.prod-nombre').value.trim();
    const final = parseInt(row.querySelector('.prod-final').value) || 0;
    if (nombre && final > 0) {
      hayInventario = true;
      reporte += `  • ${nombre}: ${final} unidades\n`;
    }
  });
  if (!hayInventario) {
    reporte += `  No hay productos en inventario\n`;
  }
  reporte += `\n`;

  const totalEfectivo = parseInt(document.getElementById('totalEfectivo').textContent.replace('$', '')) || 0;
  const totalTransferencia = parseInt(document.getElementById('totalTransferencia').textContent.replace('$', '')) || 0;
  const totalGeneral = totalEfectivo + totalTransferencia;
  const diff = totalGeneral - totalVentas;

  reporte += `💵 *EFECTIVO CONTADO:* $${totalEfectivo}\n`;
  if (totalTransferencia > 0) {
    reporte += `📱 *TRANSFERENCIAS:* $${totalTransferencia}\n`;
  }
  reporte += `💳 *TOTAL RECIBIDO:* $${totalGeneral}\n`;
  reporte += `─────────────────────────\n`;
  if (diff > 0) {
    reporte += `💰 *SOBRANTE: $${diff}*\n`;
  } else if (diff < 0) {
    reporte += `⚠️ *FALTANTE: $${Math.abs(diff)}*\n`;
  } else {
    reporte += `✅ *CUADRE EXACTO*\n`;
  }
  reporte += `═══════════════════════════════\n`;
  reporte += `🔹 TecnoRouteV - Cuadre de Negocio V1.5`;

  const mensajeCodificado = encodeURIComponent(reporte);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  try {
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${mensajeCodificado}`;
      setTimeout(() => { window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank'); }, 1000);
    } else {
      window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
    }
  } catch (e) {
    window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
  }
};

// ============================================
// CERRAR TURNO
// ============================================

window.cerrarTurno = async function() {
  const dependiente = document.getElementById('dependiente').value.trim();
  if (!dependiente) {
    notificacionError('❌ Ingresa el nombre del dependiente o turno.');
    return;
  }

  const rows = document.querySelectorAll('.producto-row');
  let totalVentas = 0;
  const productosVendidos = [];

  rows.forEach(row => {
    const nombre = row.querySelector('.prod-nombre').value.trim();
    const precio = parseInt(row.querySelector('.prod-precio').value) || 0;
    const inicial = parseInt(row.querySelector('.prod-inicial').value) || 0;
    const final = parseInt(row.querySelector('.prod-final').value) || 0;
    const vendido = inicial - final;
    if (vendido > 0 && nombre) {
      totalVentas += vendido * precio;
      productosVendidos.push({ nombre, vendido, precio, inicial, final });
    }
  });

  try {
    const inventario = await obtenerProductos();
    for (const venta of productosVendidos) {
      const producto = inventario.find(p => p.nombre === venta.nombre);
      if (producto) {
        producto.stock = Math.max(0, (producto.stock || 0) - venta.vendido);
        await actualizarProducto(producto);
      }
    }
  } catch (error) {
    console.error('❌ Error actualizando inventario:', error);
    notificacionTurnoError();
    return;
  }

  const turno = {
    fecha: new Date().toISOString(),
    turno: turnoActual,
    dependiente: dependiente,
    totalVentas: totalVentas,
    efectivo: parseInt(document.getElementById('totalEfectivo').textContent.replace('$', '')) || 0,
    transferencia: parseInt(document.getElementById('totalTransferencia').textContent.replace('$', '')) || 0,
    productos: productosVendidos,
    estado: 'cerrado'
  };

  try {
    await guardarTurno(turno);
    notificacionTurnoCerrado(dependiente, totalVentas);
    
    document.getElementById('productos-container').innerHTML = '';
    contador = 0;
    for (let i = 0; i < 3; i++) {
      window.agregarProducto('', '', '', '');
    }
    DENOMINACIONES.forEach(den => {
      document.getElementById(den.id).value = '';
    });
    document.getElementById('transferencia').value = '';
    localStorage.removeItem('cuadre_estado');
    calcularTotalBilletes();
    calcularTotal();
    
  } catch (error) {
    console.error('❌ Error guardando turno:', error);
    notificacionTurnoError();
  }
};

// ============================================
// NUEVO TURNO
// ============================================

window.nuevoTurno = function() {
  if (confirm('¿Seguro que quieres iniciar un nuevo turno? Se perderán los datos actuales.')) {
    document.getElementById('productos-container').innerHTML = '';
    document.getElementById('dependiente').value = '';
    contador = 0;
    for (let i = 0; i < 3; i++) {
      window.agregarProducto('', '', '', '');
    }
    DENOMINACIONES.forEach(den => {
      document.getElementById(den.id).value = '';
    });
    document.getElementById('transferencia').value = '';
    localStorage.removeItem('cuadre_estado');
    calcularTotalBilletes();
    calcularTotal();
    notificacionNuevoTurno();
  }
};

window.contactarDesarrollador = function() {
  window.open('https://wa.me/5352776644?text=Hola%2C%20soy%20usuario%20de%20Cuadre%20Negocio.', '_blank');
};

// ============================================
// FUNCIONES INTERNAS
// ============================================

function renderBilletes() {
  const container = document.getElementById('billetes-container');
  
  let html = `<div class="billetes-grid">`;
  DENOMINACIONES.forEach(den => {
    html += `
      <div class="billete-row">
        <span class="denom">${den.label}</span>
        <input type="number" id="${den.id}" placeholder="0" min="0">
        <span class="subtotal" id="subtotal_${den.id}">$0</span>
      </div>
    `;
  });
  html += `</div>`;
  html += `
    <div class="transferencia-row">
      <span class="denom">📱 Transferencia</span>
      <input type="number" id="transferencia" placeholder="0" min="0">
      <span class="subtotal" id="subtotal_transferencia">$0</span>
    </div>
    <div class="totales">
      <span>💰 Total en efectivo:</span>
      <span class="monto" id="totalEfectivo">$0</span>
    </div>
    <div class="totales" style="background: #E7EEF7; margin-top: 4px;">
      <span>📱 Total transferencias:</span>
      <span class="monto" id="totalTransferencia">$0</span>
    </div>
    <div class="total-general">
      <span>💳 TOTAL RECIBIDO:</span>
      <span class="monto" id="totalGeneral">$0</span>
    </div>
  `;
  container.innerHTML = html;

  DENOMINACIONES.forEach(den => {
    document.getElementById(den.id).addEventListener('input', function() {
      calcularTotalBilletes();
      guardarEstado();
    });
  });
  document.getElementById('transferencia').addEventListener('input', function() {
    calcularTotalBilletes();
    guardarEstado();
  });
}

function calcularTotalBilletes() {
  let totalEfectivo = 0;
  DENOMINACIONES.forEach(den => {
    const input = document.getElementById(den.id);
    const cantidad = parseInt(input?.value) || 0;
    const subtotal = cantidad * den.valor;
    totalEfectivo += subtotal;
    const el = document.getElementById('subtotal_' + den.id);
    if (el) el.textContent = '$' + subtotal;
  });
  
  const transferencia = parseInt(document.getElementById('transferencia')?.value) || 0;
  const sub = document.getElementById('subtotal_transferencia');
  if (sub) sub.textContent = '$' + transferencia;

  document.getElementById('totalEfectivo').textContent = '$' + totalEfectivo;
  document.getElementById('totalTransferencia').textContent = '$' + transferencia;
  const totalGeneral = totalEfectivo + transferencia;
  document.getElementById('totalGeneral').textContent = '$' + totalGeneral;

  actualizarComparador();
  actualizarTotal();
}

function calcularTotal() {
  const rows = document.querySelectorAll('.producto-row');
  let total = 0;
  rows.forEach(row => {
    const precio = parseInt(row.querySelector('.prod-precio').value) || 0;
    const inicial = parseInt(row.querySelector('.prod-inicial').value) || 0;
    const final = parseInt(row.querySelector('.prod-final').value) || 0;
    const vendido = inicial - final;
    if (vendido > 0) total += vendido * precio;
  });
  document.getElementById('total').textContent = `Total a entregar: $${total}`;
  actualizarComparador();
  actualizarTotal();
}

function actualizarTotal() {
  const totalVentas = parseInt(document.getElementById('total').textContent.replace('Total a entregar: $', '')) || 0;
  const totalEfectivo = parseInt(document.getElementById('totalEfectivo').textContent.replace('$', '')) || 0;
  const totalTransferencia = parseInt(document.getElementById('totalTransferencia').textContent.replace('$', '')) || 0;
  const totalGeneral = totalEfectivo + totalTransferencia;
  const diff = totalGeneral - totalVentas;
  const totalEl = document.getElementById('total');
  totalEl.className = 'total';
  if (diff > 0) {
    totalEl.classList.add('sobra');
  } else if (diff < 0) {
    totalEl.classList.add('falta');
  } else {
    totalEl.classList.add('exacto');
  }
}

function actualizarComparador() {
  const totalVentas = parseInt(document.getElementById('total').textContent.replace('Total a entregar: $', '')) || 0;
  const totalEfectivo = parseInt(document.getElementById('totalEfectivo').textContent.replace('$', '')) || 0;
  const totalTransferencia = parseInt(document.getElementById('totalTransferencia').textContent.replace('$', '')) || 0;
  const totalGeneral = totalEfectivo + totalTransferencia;
  const diff = totalGeneral - totalVentas;

  document.getElementById('compTotalVentas').textContent = '$' + totalVentas;
  document.getElementById('compTotalEfectivo').textContent = '$' + totalEfectivo;
  document.getElementById('compTotalTransferencia').textContent = '$' + totalTransferencia;
  document.getElementById('compTotalGeneral').textContent = '$' + totalGeneral;
  document.getElementById('compDiferencia').textContent = '$' + diff;

  const comp = document.getElementById('comparador');
  const res = document.getElementById('compResultado');
  
  comp.style.display = 'block';

  if (diff > 0) {
    res.className = 'resultado sobra';
    res.innerHTML = `<span>💰</span><span>Sobran $${diff}</span>`;
  } else if (diff < 0) {
    res.className = 'resultado falta';
    res.innerHTML = `<span>⚠️</span><span>Faltan $${Math.abs(diff)}</span>`;
  } else {
    res.className = 'resultado exacto';
    res.innerHTML = `<span>✅</span><span>Cuadre exacto</span>`;
  }
}

function guardarEstado() {
  try {
    const productos = [];
    document.querySelectorAll('.producto-row').forEach(row => {
      productos.push({
        nombre: row.querySelector('.prod-nombre').value || '',
        precio: row.querySelector('.prod-precio').value || '',
        inicial: row.querySelector('.prod-inicial').value || '',
        final: row.querySelector('.prod-final').value || ''
      });
    });
    const dependiente = document.getElementById('dependiente').value || '';
    const billetes = {};
    DENOMINACIONES.forEach(den => {
      billetes[den.id] = document.getElementById(den.id)?.value || '';
    });
    const transferencia = document.getElementById('transferencia')?.value || '';
    const estado = { productos, dependiente, billetes, transferencia, contador };
    localStorage.setItem('cuadre_estado', JSON.stringify(estado));
  } catch (e) { console.log('Error guardando:', e); }
}

function cargarEstado() {
  try {
    const data = localStorage.getItem('cuadre_estado');
    if (!data) {
      for (let i = 0; i < 3; i++) {
        window.agregarProducto('', '', '', '');
      }
      return;
    }
    const estado = JSON.parse(data);
    document.getElementById('dependiente').value = estado.dependiente || '';
    if (estado.productos && estado.productos.length > 0) {
      document.getElementById('productos-container').innerHTML = '';
      contador = estado.contador || 0;
      estado.productos.forEach(p => window.agregarProducto(p.nombre, p.precio, p.inicial, p.final));
    } else {
      for (let i = 0; i < 3; i++) {
        window.agregarProducto('', '', '', '');
      }
    }
    if (estado.billetes) {
      DENOMINACIONES.forEach(den => {
        const input = document.getElementById(den.id);
        if (input && estado.billetes[den.id] !== undefined) {
          input.value = estado.billetes[den.id];
        }
      });
    }
    if (estado.transferencia !== undefined) {
      document.getElementById('transferencia').value = estado.transferencia;
    }
    calcularTotalBilletes();
    calcularTotal();
  } catch (e) { console.log('Error cargando:', e);
    for (let i = 0; i < 3; i++) {
      window.agregarProducto('', '', '', '');
    }
  }
}

// ============================================
// EXPONER FUNCIONES GLOBALMENTE
// ============================================

window.agregarProducto = window.agregarProducto;
window.eliminarProducto = window.eliminarProducto;
window.cargarDesdeInventario = window.cargarDesdeInventario;
window.enviarWhatsApp = window.enviarWhatsApp;
window.cerrarTurno = window.cerrarTurno;
window.nuevoTurno = window.nuevoTurno;
window.contactarDesarrollador = window.contactarDesarrollador;

console.log('✅ Funciones de Cuadre expuestas globalmente');