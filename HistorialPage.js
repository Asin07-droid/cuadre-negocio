// HistorialPage.js

import { obtenerTurnos, actualizarTurno } from './src/infrastructure/indexeddb/turnosRepository.js';
import { obtenerTextoContador } from './licenciaService.js';

let turnos = [];
let filtro = 'todos';

export async function renderHistorialPage() {
  const container = document.getElementById('app-content');

  try {
    turnos = await obtenerTurnos();
    turnos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  } catch (error) {
    console.error('Error al cargar turnos:', error);
    turnos = [];
  }

  const turnosFiltrados = filtrarTurnos(turnos);
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

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h1 style="color: #16213E; font-size: 20px; margin: 0;">📋 Historial</h1>
        <span style="font-size: 13px; color: #64748B;">${turnosFiltrados.length} turnos</span>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 12px; background: #EDEFF3; padding: 4px; border-radius: 10px;">
        <button class="btn-filtro ${filtro === 'todos' ? 'active' : ''}" data-filtro="todos" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'todos' ? '#16213E' : 'transparent'}; color: ${filtro === 'todos' ? 'white' : '#64748B'}; min-height: 36px;">📋 Todos</button>
        <button class="btn-filtro ${filtro === 'dia' ? 'active' : ''}" data-filtro="dia" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'dia' ? '#B45309' : 'transparent'}; color: ${filtro === 'dia' ? 'white' : '#64748B'}; min-height: 36px;">☀️ Día</button>
        <button class="btn-filtro ${filtro === 'noche' ? 'active' : ''}" data-filtro="noche" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'noche' ? '#0B2A5C' : 'transparent'}; color: ${filtro === 'noche' ? 'white' : '#64748B'}; min-height: 36px;">🌙 Noche</button>
      </div>

      <div id="listaTurnos">
        ${turnosFiltrados.length === 0 ? `
          <div style="background: white; border-radius: 12px; padding: 40px 20px; text-align: center; color: #94A3B8; border: 1px solid #E3E6EE;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <p style="font-size: 16px; font-weight: 600; color: #64748B;">No hay turnos guardados</p>
            <p style="font-size: 14px;">Los turnos aparecerán aquí cuando los cierres</p>
          </div>
        ` : turnosFiltrados.map(turno => `
          <div class="turno-card" style="background: white; border-radius: 12px; border: 1px solid #E3E6EE; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; border-left: 4px solid ${turno.turno === 'Día' ? '#B45309' : '#0B2A5C'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
              <div style="flex: 1; min-width: 120px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-weight: 700; font-size: 15px;">${turno.dependiente || 'Sin nombre'}</span>
                  <span style="font-size: 11px; padding: 2px 10px; border-radius: 12px; background: ${turno.turno === 'Día' ? '#FDF3E3' : '#E7EEF7'}; color: ${turno.turno === 'Día' ? '#B45309' : '#0B2A5C'}; font-weight: 600;">${turno.turno === 'Día' ? '☀️ Día' : '🌙 Noche'}</span>
                </div>
                <div style="font-size: 13px; color: #64748B; margin-top: 4px;">📅 ${new Date(turno.fecha).toLocaleDateString('es-CU')} ${new Date(turno.fecha).toLocaleTimeString('es-CU', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: 700; color: #16213E;">$${turno.totalVentas || 0}</div>
                <div style="font-size: 11px; color: #94A3B8;">${turno.productos?.length || 0} productos</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 10px;">
              <button class="btn-ver-detalle" data-id="${turno.id}" style="flex: 1; padding: 6px; background: #E7EAF5; color: #16213E; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">📊 Ver Detalle</button>
              <button class="btn-eliminar-turno" data-id="${turno.id}" style="padding: 6px 12px; background: #FBEAEA; color: #9B2C2C; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>

      ${turnosFiltrados.length > 0 ? `
        <button id="btnEliminarTodos" style="width: 100%; padding: 12px; background: #FBEAEA; color: #9B2C2C; border: 2px solid #EFC3C3; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 6px; min-height: 44px;">🗑️ Eliminar Todos los Turnos</button>
      ` : ''}
    </div>
  `;

  document.querySelectorAll('.btn-filtro').forEach(btn => {
    btn.addEventListener('click', function() {
      filtro = this.dataset.filtro;
      renderHistorialPage();
    });
  });

  document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      const turno = turnos.find(t => t.id === id);
      if (turno) {
        mostrarDetalleTurno(turno);
      }
    });
  });

  document.querySelectorAll('.btn-eliminar-turno').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = parseInt(this.dataset.id);
      const turno = turnos.find(t => t.id === id);
      if (turno && confirm(`¿Eliminar turno de ${turno.dependiente || 'sin nombre'}?`)) {
        eliminarTurno(turno);
      }
    });
  });

  const btnEliminarTodos = document.getElementById('btnEliminarTodos');
  if (btnEliminarTodos) {
    btnEliminarTodos.addEventListener('click', function() {
      if (confirm('¿Eliminar TODOS los turnos? Esta acción no se puede deshacer.')) {
        eliminarTodosLosTurnos();
      }
    });
  }
}

function filtrarTurnos(turnos) {
  // ✅ Filtrar turnos eliminados
  const activos = turnos.filter(t => t.estado !== 'eliminado');
  
  if (filtro === 'todos') return activos;
  return activos.filter(t => t.turno === (filtro === 'dia' ? 'Día' : 'Noche'));
}

function mostrarDetalleTurno(turno) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
    backdrop-filter: blur(4px);
  `;

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 400px; width: 100%; max-height: 80vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #E3E6EE; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; font-size: 17px;">📊 Detalle del Turno</h3>
          <p style="margin: 2px 0 0; font-size: 13px; color: #64748B;">${turno.dependiente || 'Sin nombre'} • ${turno.turno === 'Día' ? '☀️ Día' : '🌙 Noche'}</p>
        </div>
        <button id="btnCerrarDetalle" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748B;">✖</button>
      </div>
      
      <div style="padding: 16px 20px; overflow-y: auto; max-height: calc(80vh - 120px);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div style="background: #F1F2F6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748B;">📅 Fecha</div>
            <div style="font-weight: 600; font-size: 14px;">${new Date(turno.fecha).toLocaleDateString('es-CU')}</div>
          </div>
          <div style="background: #F1F2F6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748B;">💰 Total</div>
            <div style="font-weight: 700; font-size: 18px; color: #16213E;">$${turno.totalVentas || 0}</div>
          </div>
          <div style="background: #F1F2F6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748B;">💵 Efectivo</div>
            <div style="font-weight: 600; font-size: 14px;">$${turno.efectivo || 0}</div>
          </div>
          <div style="background: #F1F2F6; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #64748B;">📱 Transferencias</div>
            <div style="font-weight: 600; font-size: 14px;">$${turno.transferencia || 0}</div>
          </div>
        </div>

        ${turno.productos && turno.productos.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin: 0 0 8px 0;">🛍️ Productos vendidos</h4>
            ${turno.productos.map(p => `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #EDEFF3; font-size: 13px;">
                <span>${p.nombre || 'Producto'}</span>
                <span style="color: #16213E; font-weight: 600;">${p.vendido} x $${p.precio} = $${p.vendido * p.precio}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="padding: 12px; text-align: center; color: #94A3B8; font-size: 14px;">No hay productos registrados en este turno</div>
        `}

        <div style="margin-top: 12px; padding: 10px; background: ${turno.estado === 'cerrado' ? '#E7F3EC' : '#FDF3E3'}; border-radius: 8px; border: 1px solid ${turno.estado === 'cerrado' ? '#A9CBB6' : '#E9C88A'}; text-align: center;">
          <span style="font-weight: 600; color: ${turno.estado === 'cerrado' ? '#1F6E43' : '#B45309'};">
            ${turno.estado === 'cerrado' ? '✅ Turno cerrado' : '🟡 Turno abierto'}
          </span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btnCerrarDetalle').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ============================================
// ELIMINAR TURNO - CORREGIDO
// ============================================

async function eliminarTurno(turno) {
  try {
    // Actualizar en la base de datos
    await actualizarTurno({ ...turno, estado: 'eliminado' });
    
    // Eliminar de la lista en memoria
    const index = turnos.findIndex(t => t.id === turno.id);
    if (index !== -1) {
      turnos.splice(index, 1);
    }
    
    mostrarToast('🗑️ Turno eliminado');
    renderHistorialPage();
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    mostrarToast('❌ Error al eliminar el turno');
  }
}

// ============================================
// ELIMINAR TODOS LOS TURNOS - CORREGIDO
// ============================================

async function eliminarTodosLosTurnos() {
  try {
    // Obtener solo los turnos activos (no eliminados)
    const turnosActivos = turnos.filter(t => t.estado !== 'eliminado');
    
    // Marcar todos como eliminados en la base de datos
    for (const t of turnosActivos) {
      await actualizarTurno({ ...t, estado: 'eliminado' });
    }
    
    // Actualizar la lista en memoria (solo quedan los ya eliminados)
    turnos = turnos.filter(t => t.estado === 'eliminado');
    
    mostrarToast(`🗑️ ${turnosActivos.length} turnos eliminados`);
    renderHistorialPage();
  } catch (error) {
    console.error('Error al eliminar turnos:', error);
    mostrarToast('❌ Error al eliminar los turnos');
  }
}

function mostrarToast(mensaje) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1E2433; color: white; padding: 10px 20px; border-radius: 10px; display: none; font-size: 13px; max-width: 90%; text-align: center; z-index: 1000;';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}