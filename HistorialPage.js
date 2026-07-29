// HistorialPage.js

import { obtenerTurnos } from './src/infrastructure/indexeddb/turnosRepository.js';
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
        <h1 style="color: #1a237e; font-size: 20px; margin: 0;">📋 Historial</h1>
        <span style="font-size: 13px; color: #666;">${turnosFiltrados.length} turnos</span>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 12px; background: #f0f2f5; padding: 4px; border-radius: 10px;">
        <button class="btn-filtro ${filtro === 'todos' ? 'active' : ''}" data-filtro="todos" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'todos' ? '#1a237e' : 'transparent'}; color: ${filtro === 'todos' ? 'white' : '#666'}; min-height: 36px;">📋 Todos</button>
        <button class="btn-filtro ${filtro === 'dia' ? 'active' : ''}" data-filtro="dia" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'dia' ? '#f57c00' : 'transparent'}; color: ${filtro === 'dia' ? 'white' : '#666'}; min-height: 36px;">☀️ Día</button>
        <button class="btn-filtro ${filtro === 'noche' ? 'active' : ''}" data-filtro="noche" style="flex: 1; padding: 8px; border: none; border-radius: 8px; font-weight: 600; font-size: 12px; cursor: pointer; background: ${filtro === 'noche' ? '#0d47a1' : 'transparent'}; color: ${filtro === 'noche' ? 'white' : '#666'}; min-height: 36px;">🌙 Noche</button>
      </div>

      <div id="listaTurnos">
        ${turnosFiltrados.length === 0 ? `
          <div style="background: white; border-radius: 12px; padding: 40px 20px; text-align: center; color: #999; border: 1px solid #e8ecf1;">
            <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
            <p style="font-size: 16px; font-weight: 600; color: #666;">No hay turnos guardados</p>
            <p style="font-size: 14px;">Los turnos aparecerán aquí cuando los cierres</p>
          </div>
        ` : turnosFiltrados.map(turno => `
          <div class="turno-card" style="background: white; border-radius: 12px; border: 1px solid #e8ecf1; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s; border-left: 4px solid ${turno.turno === 'Día' ? '#f57c00' : '#0d47a1'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
              <div style="flex: 1; min-width: 120px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-weight: 700; font-size: 15px;">${turno.dependiente || 'Sin nombre'}</span>
                  <span style="font-size: 11px; padding: 2px 10px; border-radius: 12px; background: ${turno.turno === 'Día' ? '#fff3e0' : '#e3f2fd'}; color: ${turno.turno === 'Día' ? '#e65100' : '#0d47a1'}; font-weight: 600;">${turno.turno === 'Día' ? '☀️ Día' : '🌙 Noche'}</span>
                </div>
                <div style="font-size: 13px; color: #666; margin-top: 4px;">📅 ${new Date(turno.fecha).toLocaleDateString('es-CU')} ${new Date(turno.fecha).toLocaleTimeString('es-CU', {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: 700; color: #1a237e;">$${turno.totalVentas || 0}</div>
                <div style="font-size: 11px; color: #999;">${turno.productos?.length || 0} productos</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 10px;">
              <button class="btn-ver-detalle" data-id="${turno.id}" style="flex: 1; padding: 6px; background: #e8eaf6; color: #1a237e; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">📊 Ver Detalle</button>
              <button class="btn-eliminar-turno" data-id="${turno.id}" style="padding: 6px 12px; background: #fef2f2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>

      ${turnosFiltrados.length > 0 ? `
        <button id="btnEliminarTodos" style="width: 100%; padding: 12px; background: #fef2f2; color: #dc2626; border: 2px solid #fecaca; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 6px; min-height: 44px;">🗑️ Eliminar Todos los Turnos</button>
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
  if (filtro === 'todos') return turnos;
  return turnos.filter(t => t.turno === (filtro === 'dia' ? 'Día' : 'Noche'));
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
      <div style="padding: 16px 20px; border-bottom: 1px solid #e8ecf1; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; font-size: 17px;">📊 Detalle del Turno</h3>
          <p style="margin: 2px 0 0; font-size: 13px; color: #666;">${turno.dependiente || 'Sin nombre'} • ${turno.turno === 'Día' ? '☀️ Día' : '🌙 Noche'}</p>
        </div>
        <button id="btnCerrarDetalle" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">✖</button>
      </div>
      
      <div style="padding: 16px 20px; overflow-y: auto; max-height: calc(80vh - 120px);">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #666;">📅 Fecha</div>
            <div style="font-weight: 600; font-size: 14px;">${new Date(turno.fecha).toLocaleDateString('es-CU')}</div>
          </div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #666;">💰 Total</div>
            <div style="font-weight: 700; font-size: 18px; color: #1a237e;">$${turno.totalVentas || 0}</div>
          </div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #666;">💵 Efectivo</div>
            <div style="font-weight: 600; font-size: 14px;">$${turno.efectivo || 0}</div>
          </div>
          <div style="background: #f5f5f5; padding: 10px; border-radius: 8px; text-align: center;">
            <div style="font-size: 11px; color: #666;">📱 Transferencias</div>
            <div style="font-weight: 600; font-size: 14px;">$${turno.transferencia || 0}</div>
          </div>
        </div>

        ${turno.productos && turno.productos.length > 0 ? `
          <div style="margin-bottom: 12px;">
            <h4 style="font-size: 14px; margin: 0 0 8px 0;">🛍️ Productos vendidos</h4>
            ${turno.productos.map(p => `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px;">
                <span>${p.nombre || 'Producto'}</span>
                <span style="color: #1a237e; font-weight: 600;">${p.vendido} x $${p.precio} = $${p.vendido * p.precio}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="padding: 12px; text-align: center; color: #999; font-size: 14px;">No hay productos registrados en este turno</div>
        `}

        <div style="margin-top: 12px; padding: 10px; background: ${turno.estado === 'cerrado' ? '#e8f5e9' : '#fff3e0'}; border-radius: 8px; border: 1px solid ${turno.estado === 'cerrado' ? '#a5d6a7' : '#ffcc80'}; text-align: center;">
          <span style="font-weight: 600; color: ${turno.estado === 'cerrado' ? '#2e7d32' : '#e65100'};">
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

async function eliminarTurno(turno) {
  try {
    const { actualizarTurno } = await import('./src/infrastructure/indexeddb/turnosRepository.js');
    await actualizarTurno({ ...turno, estado: 'eliminado' });
    mostrarToast('🗑️ Turno eliminado');
    renderHistorialPage();
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    mostrarToast('❌ Error al eliminar el turno');
  }
}

async function eliminarTodosLosTurnos() {
  try {
    const { actualizarTurno } = await import('./src/infrastructure/indexeddb/turnosRepository.js');
    for (const turno of turnos) {
      await actualizarTurno({ ...turno, estado: 'eliminado' });
    }
    mostrarToast(`🗑️ ${turnos.length} turnos eliminados`);
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
    toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #1a2332; color: white; padding: 10px 20px; border-radius: 10px; display: none; font-size: 13px; max-width: 90%; text-align: center; z-index: 1000;';
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}