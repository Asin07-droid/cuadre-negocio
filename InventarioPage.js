// InventarioPage.js

import { 
  obtenerProductos, 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto 
} from './src/infrastructure/indexeddb/productosRepository.js';
import {
  notificacionExito,
  notificacionError,
  notificacionInfo,
  notificacionAdvertencia,
  notificacionInventarioExportado,
  notificacionInventarioImportado,
  notificacionInventarioError,
  notificacionProductoAgregado,
  notificacionProductoEliminado,
  notificacionProductoActualizado,
  notificacionSinProductos,
  notificacionImportacionCancelada,
  notificacionWhatsAppEnviado
} from './notificacionService.js';
import { obtenerTextoContador } from './licenciaService.js';

let productos = [];

export async function renderInventarioPage() {
  const container = document.getElementById('app-content');

  try {
    productos = await obtenerProductos();
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error('Error al cargar productos:', error);
    productos = [];
  }

  const contadorExistente = document.getElementById('licenciaContador');
  const contadorLicencia = contadorExistente ? contadorExistente.textContent : '🔓 3d gratis';

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

      <!-- TÍTULO -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h1 style="color: #1a237e; font-size: 20px; margin: 0;">📦 Inventario</h1>
        <span style="font-size: 13px; color: #666;">${productos.length} productos</span>
      </div>

      <!-- SOLO 3 BOTONES -->
      <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <button id="btnExportarInventario" style="flex: 1; padding: 10px; background: #1a237e; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">
          📲 Exportar (WhatsApp)
        </button>
        <button id="btnImportarInventario" style="flex: 1; padding: 10px; background: #2e7d32; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">
          📥 Importar
        </button>
        <button id="btnAgregarProducto" style="flex: 1; padding: 10px; background: #f57c00; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">
          ➕ Agregar
        </button>
      </div>

      <!-- MODAL PARA IMPORTAR DESDE WHATSAPP -->
      <div id="modalImportarWhatsApp" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; padding: 20px; backdrop-filter: blur(4px);">
        <div style="background: white; border-radius: 16px; max-width: 400px; width: 100%; margin: 50px auto; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <h3 style="margin: 0 0 10px 0; color: #1a237e;">📥 Importar desde WhatsApp</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 12px;">Copia el mensaje de WhatsApp que contiene el inventario y pégalo aquí:</p>
          <textarea id="textoWhatsApp" style="width: 100%; height: 200px; padding: 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; font-family: monospace; box-sizing: border-box; resize: vertical;"></textarea>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button id="btnCancelarImport" style="flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">Cancelar</button>
            <button id="btnImportarTexto" style="flex: 2; padding: 12px; background: #1a237e; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">📥 Importar</button>
          </div>
        </div>
      </div>

      <div id="listaProductos">
        ${productos.length === 0 ? `
          <div style="background: white; border-radius: 12px; padding: 40px 20px; text-align: center; color: #999; border: 1px solid #e8ecf1;">
            <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
            <p style="font-size: 16px; font-weight: 600; color: #666;">No hay productos registrados</p>
            <p style="font-size: 14px;">Haz clic en "Agregar" para crear tu primer producto</p>
          </div>
        ` : `
          <div style="background: white; border-radius: 12px; border: 1px solid #e8ecf1; overflow: hidden;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 10px 12px; background: #f5f5f5; font-weight: 600; font-size: 12px; color: #666; border-bottom: 1px solid #e0e0e0;">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span style="text-align: center;">Acciones</span>
            </div>
            ${productos.map(p => `
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 10px 12px; border-bottom: 1px solid #f0f0f0; align-items: center;">
                <span style="font-weight: 500; font-size: 14px;">${p.nombre}</span>
                <span style="color: #1a237e; font-weight: 600; font-size: 14px;">$${p.precio}</span>
                <span style="font-size: 14px;">${p.stock || 0}</span>
                <div style="display: flex; gap: 6px; justify-content: center;">
                  <button class="btn-editar" data-id="${p.id}" style="background: none; border: none; color: #1a237e; cursor: pointer; font-size: 16px; padding: 4px; min-height: 36px; min-width: 36px;" title="Editar">✏️</button>
                  <button class="btn-eliminar" data-id="${p.id}" style="background: none; border: none; color: #dc2626; cursor: pointer; font-size: 16px; padding: 4px; min-height: 36px; min-width: 36px;" title="Eliminar">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // ============================================
  // EVENTOS
  // ============================================

  document.getElementById('btnAgregarProducto').addEventListener('click', () => mostrarModalProducto(null));
  
  // Exportar = Enviar por WhatsApp
  document.getElementById('btnExportarInventario').addEventListener('click', enviarInventarioWhatsApp);
  
  // Importar = Abrir modal para pegar texto
  document.getElementById('btnImportarInventario').addEventListener('click', () => {
    document.getElementById('modalImportarWhatsApp').style.display = 'block';
    document.getElementById('textoWhatsApp').value = '';
    document.getElementById('textoWhatsApp').focus();
  });

  document.getElementById('btnCancelarImport').addEventListener('click', () => {
    document.getElementById('modalImportarWhatsApp').style.display = 'none';
  });

  document.getElementById('btnImportarTexto').addEventListener('click', importarDesdeWhatsApp);

  document.getElementById('modalImportarWhatsApp').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });

  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      const producto = productos.find(p => p.id === id);
      if (producto) {
        mostrarModalProducto(producto);
      }
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.dataset.id);
      const producto = productos.find(p => p.id === id);
      if (producto && confirm(`¿Eliminar "${producto.nombre}"?`)) {
        eliminarProductoHandler(producto);
      }
    });
  });
}

// ============================================
// MODAL: AGREGAR / EDITAR PRODUCTO
// ============================================

function mostrarModalProducto(producto) {
  const esEdicion = producto !== null;
  const titulo = esEdicion ? '✏️ Editar Producto' : '➕ Agregar Producto';

  const nombreDefault = producto ? producto.nombre : '';
  const precioDefault = producto ? producto.precio : '';
  const stockDefault = producto ? (producto.stock || 0) : '';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px; backdrop-filter: blur(4px);';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 380px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding: 20px 20px 16px; border-bottom: 1px solid #e8ecf1;">
        <h3 style="margin: 0; font-size: 18px; color: #1a237e;">${titulo}</h3>
      </div>
      
      <div style="padding: 20px;">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #666; margin-bottom: 4px;">Nombre del producto *</label>
          <input type="text" id="modalNombre" value="${nombreDefault}" placeholder="Ej: Leche, Pan, Queso..." style="width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #666; margin-bottom: 4px;">Precio (en pesos) *</label>
          <input type="number" id="modalPrecio" value="${precioDefault}" placeholder="0" min="0" step="0.01" style="width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #666; margin-bottom: 4px;">Cantidad en existencia</label>
          <input type="number" id="modalStock" value="${stockDefault}" placeholder="0" min="0" style="width: 100%; padding: 12px 14px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="btnModalCancelar" style="flex: 1; padding: 12px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">Cancelar</button>
          <button id="btnModalGuardar" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #1a237e, #0d47a1); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">${esEdicion ? '💾 Actualizar' : '➕ Agregar'}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btnModalCancelar').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById('btnModalGuardar').addEventListener('click', async function() {
    const nombre = document.getElementById('modalNombre').value.trim();
    const precio = parseFloat(document.getElementById('modalPrecio').value);
    const stock = parseInt(document.getElementById('modalStock').value) || 0;

    if (!nombre) {
      notificacionError('El nombre del producto es obligatorio');
      document.getElementById('modalNombre').focus();
      return;
    }

    if (isNaN(precio) || precio <= 0) {
      notificacionError('Ingresa un precio válido mayor que 0');
      document.getElementById('modalPrecio').focus();
      return;
    }

    try {
      if (esEdicion) {
        const productoActualizado = {
          id: producto.id,
          nombre: nombre,
          precio: precio,
          stock: stock,
          categoria: producto.categoria || 'General'
        };
        
        await actualizarProducto(productoActualizado);
        notificacionExito(`"${nombre}" actualizado`);
        overlay.remove();
        renderInventarioPage();
      } else {
        const existe = productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (existe) {
          notificacionError(`Ya existe "${nombre}"`);
          return;
        }
        
        await agregarProducto({ 
          nombre: nombre, 
          precio: precio, 
          stock: stock, 
          categoria: 'General' 
        });
        notificacionExito(`"${nombre}" agregado`);
        overlay.remove();
        renderInventarioPage();
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      notificacionError('Error al guardar: ' + error.message);
    }
  });

  overlay.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btnModalGuardar').click();
      }
    });
  });

  setTimeout(() => {
    document.getElementById('modalNombre').focus();
    document.getElementById('modalNombre').select();
  }, 100);
}

// ============================================
// ENVIAR INVENTARIO POR WHATSAPP
// ============================================

function enviarInventarioWhatsApp() {
  if (productos.length === 0) {
    notificacionSinProductos();
    return;
  }

  notificacionWhatsAppEnviado();

  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-CU') + ' ' + fecha.toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });

  let mensaje = '';
  mensaje += '📦 *INVENTARIO DE PRODUCTOS*\n';
  mensaje += `📅 *Fecha:* ${fechaStr}\n`;
  mensaje += `📦 *Total:* ${productos.length} productos\n`;
  mensaje += '═══════════════════════════════\n\n';
  mensaje += '*Producto* | *Precio* | *Stock*\n';
  mensaje += '──────────|─────────|───────\n';

  productos.forEach(p => {
    mensaje += `${p.nombre} | $${p.precio} | ${p.stock || 0}\n`;
  });

  mensaje += '\n═══════════════════════════════\n';
  mensaje += '🔹 TecnoRouteV - Cuadre de Negocio V1.5';

  const mensajeCodificado = encodeURIComponent(mensaje);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  try {
    if (isMobile) {
      window.location.href = `whatsapp://send?text=${mensajeCodificado}`;
      setTimeout(() => { 
        window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank'); 
      }, 1000);
    } else {
      window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
    }
  } catch (e) {
    window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
  }
}

// ============================================
// IMPORTAR DESDE WHATSAPP (TEXTO PEGADO)
// ============================================

async function importarDesdeWhatsApp() {
  const texto = document.getElementById('textoWhatsApp').value;
  
  if (!texto || texto.trim() === '') {
    notificacionError('Pega el mensaje de WhatsApp con el inventario');
    return;
  }

  try {
    const productosImportados = parsearTextoInventario(texto);

    if (productosImportados.length === 0) {
      notificacionError('No se encontraron productos válidos en el mensaje');
      return;
    }

    let mensaje = `📦 Se importarán ${productosImportados.length} productos:\n\n`;
    productosImportados.slice(0, 5).forEach(function(p) {
      mensaje += `  • ${p.nombre}: ${p.stock || 0} unidades ($${p.precio})\n`;
    });
    if (productosImportados.length > 5) {
      mensaje += `\n  ... y ${productosImportados.length - 5} más.`;
    }
    mensaje += `\n\n¿Deseas continuar con la importación?`;

    if (!confirm(mensaje)) {
      notificacionImportacionCancelada();
      document.getElementById('modalImportarWhatsApp').style.display = 'none';
      return;
    }

    let importados = 0;
    let actualizados = 0;

    for (var j = 0; j < productosImportados.length; j++) {
      const prod = productosImportados[j];
      const existente = productos.find(p => p.nombre.toLowerCase() === prod.nombre.toLowerCase());
      
      if (existente) {
        existente.precio = prod.precio;
        existente.stock = prod.stock || 0;
        await actualizarProducto(existente);
        actualizados++;
      } else {
        await agregarProducto(prod);
        importados++;
      }
    }

    document.getElementById('modalImportarWhatsApp').style.display = 'none';
    notificacionInventarioImportado(importados, actualizados);
    setTimeout(() => { renderInventarioPage(); }, 500);

  } catch (error) {
    console.error('Error al importar desde WhatsApp:', error);
    notificacionInventarioError('Error al importar: ' + error.message);
  }
}

// ============================================
// PARSEAR TEXTO DE INVENTARIO (WhatsApp)
// ============================================

function parsearTextoInventario(texto) {
  const lineas = texto.split('\n');
  const productosImportados = [];
  let enTabla = false;

  for (var i = 0; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    
    if (!linea) continue;
    
    if (linea.includes('Producto') && linea.includes('Precio') && linea.includes('Stock')) {
      enTabla = true;
      continue;
    }
    
    if (enTabla && (linea.startsWith('===') || linea.startsWith('---') || linea.startsWith('🔹') || linea.startsWith('═'))) {
      break;
    }
    
    if (enTabla) {
      let partes = [];
      
      if (linea.includes('|')) {
        partes = linea.split('|').map(s => s.trim());
      } else if (linea.includes('\t')) {
        partes = linea.split('\t').map(s => s.trim());
      } else {
        partes = linea.split(/\s{2,}/).map(s => s.trim());
      }
      
      partes = partes.filter(s => s.length > 0);
      
      if (partes.length >= 3) {
        const nombre = partes[0].trim();
        const precioStr = partes[1].trim().replace('$', '').replace(',', '').trim();
        const precio = parseFloat(precioStr);
        const stock = parseInt(partes[2].trim()) || 0;
        
        if (nombre && !isNaN(precio) && precio > 0 && !nombre.includes('Producto') && !nombre.includes('──────────')) {
          productosImportados.push({
            nombre: nombre,
            precio: precio,
            stock: stock,
            categoria: 'General'
          });
        }
      }
    }
  }

  return productosImportados;
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================

async function eliminarProductoHandler(producto) {
  try {
    await eliminarProducto(producto.id);
    notificacionExito(`"${producto.nombre}" eliminado`);
    renderInventarioPage();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    notificacionError('Error al eliminar: ' + error.message);
  }
}