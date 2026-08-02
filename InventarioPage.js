// InventarioPage.js

import { 
  obtenerProductos, 
  agregarProducto, 
  actualizarProducto, 
  eliminarProducto 
} from './src/infrastructure/indexeddb/productosRepository.js';
import { obtenerTextoContador } from './licenciaService.js';
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

var productos = [];

export async function renderInventarioPage() {
  var container = document.getElementById('app-content');

  try {
    productos = await obtenerProductos();
    productos.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
  } catch (error) {
    console.error('Error al cargar productos:', error);
    productos = [];
  }

  var contadorLicencia = obtenerTextoContador();

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
        <h1 style="color: #16213E; font-size: 20px; margin: 0;">📦 Inventario</h1>
        <span style="font-size: 13px; color: #64748B;">${productos.length} productos</span>
      </div>

      <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <button id="btnExportarInventario" style="flex: 1; padding: 10px; background: #16213E; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">📲 Exportar (WhatsApp)</button>
        <button id="btnImportarInventario" style="flex: 1; padding: 10px; background: #1F6E43; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">📥 Importar</button>
        <button id="btnAgregarProducto" style="flex: 1; padding: 10px; background: #B45309; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; min-height: 44px;">➕ Agregar</button>
      </div>

      <div id="modalImportarWhatsApp" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; padding: 20px; backdrop-filter: blur(4px);">
        <div style="background: white; border-radius: 16px; max-width: 400px; width: 100%; margin: 50px auto; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <h3 style="margin: 0 0 10px 0; color: #16213E;">📥 Importar desde WhatsApp</h3>
          <p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">Copia el mensaje de WhatsApp que contiene el inventario y pégalo aquí:</p>
          <textarea id="textoWhatsApp" style="width: 100%; height: 200px; padding: 12px; border: 1px solid #DCE0E8; border-radius: 8px; font-size: 14px; font-family: monospace; box-sizing: border-box; resize: vertical;"></textarea>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button id="btnCancelarImport" style="flex: 1; padding: 12px; background: #DCE0E8; color: #1E2433; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">Cancelar</button>
            <button id="btnImportarTexto" style="flex: 2; padding: 12px; background: #16213E; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">📥 Importar</button>
          </div>
        </div>
      </div>

      <div id="listaProductos">
        ${productos.length === 0 ? `
          <div style="background: white; border-radius: 12px; padding: 40px 20px; text-align: center; color: #94A3B8; border: 1px solid #E3E6EE;">
            <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
            <p style="font-size: 16px; font-weight: 600; color: #64748B;">No hay productos registrados</p>
            <p style="font-size: 14px;">Haz clic en "Agregar" para crear tu primer producto</p>
          </div>
        ` : `
          <div style="background: white; border-radius: 12px; border: 1px solid #E3E6EE; overflow: hidden;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 10px 12px; background: #F1F2F6; font-weight: 600; font-size: 12px; color: #64748B; border-bottom: 1px solid #DCE0E8;">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span style="text-align: center;">Acciones</span>
            </div>
            ${productos.map(function(p) { return `
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; padding: 10px 12px; border-bottom: 1px solid #EDEFF3; align-items: center;">
                <span style="font-weight: 500; font-size: 14px;">${p.nombre}</span>
                <span style="color: #16213E; font-weight: 600; font-size: 14px;">$${p.precio}</span>
                <span style="font-size: 14px;">${p.stock || 0}</span>
                <div style="display: flex; gap: 6px; justify-content: center;">
                  <button class="btn-editar" data-id="${p.id}" style="background: none; border: none; color: #16213E; cursor: pointer; font-size: 16px; padding: 4px; min-height: 36px; min-width: 36px;" title="Editar">✏️</button>
                  <button class="btn-eliminar" data-id="${p.id}" style="background: none; border: none; color: #9B2C2C; cursor: pointer; font-size: 16px; padding: 4px; min-height: 36px; min-width: 36px;" title="Eliminar">🗑️</button>
                </div>
              </div>
            `; }).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // ============================================
  // EVENTOS
  // ============================================

  document.getElementById('btnAgregarProducto').addEventListener('click', function() { mostrarModalProducto(null); });
  document.getElementById('btnExportarInventario').addEventListener('click', enviarInventarioWhatsApp);
  document.getElementById('btnImportarInventario').addEventListener('click', function() {
    document.getElementById('modalImportarWhatsApp').style.display = 'block';
    document.getElementById('textoWhatsApp').value = '';
    document.getElementById('textoWhatsApp').focus();
  });
  document.getElementById('btnCancelarImport').addEventListener('click', function() {
    document.getElementById('modalImportarWhatsApp').style.display = 'none';
  });
  document.getElementById('btnImportarTexto').addEventListener('click', importarDesdeWhatsApp);
  document.getElementById('modalImportarWhatsApp').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });

  document.querySelectorAll('.btn-editar').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = parseInt(this.dataset.id);
      var producto = productos.find(function(p) { return p.id === id; });
      if (producto) {
        mostrarModalProducto(producto);
      }
    });
  });

  document.querySelectorAll('.btn-eliminar').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = parseInt(this.dataset.id);
      var producto = productos.find(function(p) { return p.id === id; });
      if (producto && confirm('¿Eliminar "' + producto.nombre + '"?')) {
        eliminarProductoHandler(producto);
      }
    });
  });
}

function mostrarModalProducto(producto) {
  var esEdicion = producto !== null;
  var titulo = esEdicion ? '✏️ Editar Producto' : '➕ Agregar Producto';

  var nombreDefault = producto ? producto.nombre : '';
  var precioDefault = producto ? producto.precio : '';
  var stockDefault = producto ? (producto.stock || 0) : '';

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 20px; backdrop-filter: blur(4px);';

  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 380px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="padding: 20px 20px 16px; border-bottom: 1px solid #E3E6EE;">
        <h3 style="margin: 0; font-size: 18px; color: #16213E;">${titulo}</h3>
      </div>
      
      <div style="padding: 20px;">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #64748B; margin-bottom: 4px;">Nombre del producto *</label>
          <input type="text" id="modalNombre" value="${nombreDefault}" placeholder="Ej: Leche, Pan, Queso..." style="width: 100%; padding: 12px 14px; border: 1px solid #DCE0E8; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #64748B; margin-bottom: 4px;">Precio (en pesos) *</label>
          <input type="number" id="modalPrecio" value="${precioDefault}" placeholder="0" min="0" step="0.01" style="width: 100%; padding: 12px 14px; border: 1px solid #DCE0E8; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 13px; color: #64748B; margin-bottom: 4px;">Cantidad en existencia</label>
          <input type="number" id="modalStock" value="${stockDefault}" placeholder="0" min="0" style="width: 100%; padding: 12px 14px; border: 1px solid #DCE0E8; border-radius: 8px; font-size: 14px; min-height: 44px; box-sizing: border-box;">
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button id="btnModalCancelar" style="flex: 1; padding: 12px; background: #DCE0E8; color: #1E2433; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">Cancelar</button>
          <button id="btnModalGuardar" style="flex: 2; padding: 12px; background: linear-gradient(135deg, #16213E, #0B2A5C); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; min-height: 44px;">${esEdicion ? '💾 Actualizar' : '➕ Agregar'}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('btnModalCancelar').addEventListener('click', function() { overlay.remove(); });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });

  document.getElementById('btnModalGuardar').addEventListener('click', async function() {
    var nombre = document.getElementById('modalNombre').value.trim();
    var precio = parseFloat(document.getElementById('modalPrecio').value);
    var stock = parseInt(document.getElementById('modalStock').value) || 0;

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
        var productoActualizado = {
          id: producto.id,
          nombre: nombre,
          precio: precio,
          stock: stock,
          categoria: producto.categoria || 'General'
        };
        
        await actualizarProducto(productoActualizado);
        notificacionExito('"' + nombre + '" actualizado');
        overlay.remove();
        renderInventarioPage();
      } else {
        var existe = productos.some(function(p) {
          return p.nombre.toLowerCase() === nombre.toLowerCase();
        });
        if (existe) {
          notificacionError('Ya existe "' + nombre + '"');
          return;
        }
        
        await agregarProducto({ 
          nombre: nombre, 
          precio: precio, 
          stock: stock, 
          categoria: 'General' 
        });
        notificacionExito('"' + nombre + '" agregado');
        overlay.remove();
        renderInventarioPage();
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      notificacionError('Error al guardar: ' + error.message);
    }
  });

  overlay.querySelectorAll('input').forEach(function(input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        document.getElementById('btnModalGuardar').click();
      }
    });
  });

  setTimeout(function() {
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

  var fecha = new Date();
  var fechaStr = fecha.toLocaleDateString('es-CU') + ' ' + fecha.toLocaleTimeString('es-CU', { hour: '2-digit', minute: '2-digit' });

  // ============================================
  // CALCULAR ANCHOS
  // ============================================
  var maxNombre = 8;
  var maxPrecio = 6;
  var maxStock = 6;
  
  productos.forEach(function(p) {
    var nombreLen = p.nombre.length;
    var precioLen = String(p.precio).length;
    var stockLen = String(p.stock || 0).length;
    
    if (nombreLen > maxNombre) maxNombre = nombreLen;
    if (precioLen > maxPrecio) maxPrecio = precioLen;
    if (stockLen > maxStock) maxStock = stockLen;
  });

  maxNombre = maxNombre + 1;
  maxPrecio = maxPrecio + 1;
  maxStock = maxStock + 1;

  // ============================================
  // CONSTRUIR TABLA
  // ============================================
  var lineas = [];
  
  var header = 'Producto';
  var headerPrecio = 'Precio';
  var headerStock = 'Cantidad';
  
  var separador = '';
  separador += '-'.repeat(maxNombre + 1) + '|';
  separador += '-'.repeat(maxPrecio + 1) + '|';
  separador += '-'.repeat(maxStock + 1);
  
  lineas.push(header.padEnd(maxNombre + 1) + '|' + headerPrecio.padEnd(maxPrecio + 1) + '|' + headerStock.padEnd(maxStock + 1));
  lineas.push(separador);
  
  productos.forEach(function(p) {
    var nombre = p.nombre.padEnd(maxNombre + 1);
    var precio = ('$' + p.precio).padEnd(maxPrecio + 1);
    var stock = String(p.stock || 0).padEnd(maxStock + 1);
    lineas.push(nombre + '|' + precio + '|' + stock);
  });

  // ============================================
  // ARMAR MENSAJE
  // ============================================
  var mensaje = '';
  mensaje += '📦 *INVENTARIO DE PRODUCTOS*\n';
  mensaje += '📅 *Fecha:* ' + fechaStr + '\n';
  mensaje += '📦 *Total:* ' + productos.length + ' productos\n';
  mensaje += '═══════════════════════════════\n\n';
  mensaje += lineas.join('\n');
  mensaje += '\n\n═══════════════════════════════\n';
  mensaje += '🔹 TecnoRouteV - Cuadre de Negocio V1.5';

  var mensajeCodificado = encodeURIComponent(mensaje);
  var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  try {
    if (isMobile) {
      window.location.href = 'whatsapp://send?text=' + mensajeCodificado;
      setTimeout(function() { 
        window.open('https://wa.me/?text=' + mensajeCodificado, '_blank'); 
      }, 1000);
    } else {
      window.open('https://wa.me/?text=' + mensajeCodificado, '_blank');
    }
  } catch (e) {
    window.open('https://wa.me/?text=' + mensajeCodificado, '_blank');
  }
}

// ============================================
// IMPORTAR DESDE WHATSAPP
// ============================================

async function importarDesdeWhatsApp() {
  var texto = document.getElementById('textoWhatsApp').value;
  
  if (!texto || texto.trim() === '') {
    notificacionError('Pega el mensaje de WhatsApp con el inventario');
    return;
  }

  try {
    var productosImportados = parsearTextoInventario(texto);

    if (productosImportados.length === 0) {
      notificacionError('No se encontraron productos válidos en el mensaje');
      return;
    }

    var mensaje = '📦 Se importarán ' + productosImportados.length + ' productos:\n\n';
    productosImportados.slice(0, 5).forEach(function(p) {
      mensaje += '  • ' + p.nombre + ': ' + (p.stock || 0) + ' unidades ($' + p.precio + ')\n';
    });
    if (productosImportados.length > 5) {
      mensaje += '\n  ... y ' + (productosImportados.length - 5) + ' más.';
    }
    mensaje += '\n\n¿Deseas continuar con la importación?';

    if (!confirm(mensaje)) {
      notificacionImportacionCancelada();
      document.getElementById('modalImportarWhatsApp').style.display = 'none';
      return;
    }

    var importados = 0;
    var actualizados = 0;

    for (var j = 0; j < productosImportados.length; j++) {
      var prod = productosImportados[j];
      var existente = productos.find(function(p) {
        return p.nombre.toLowerCase() === prod.nombre.toLowerCase();
      });
      
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
    setTimeout(function() { renderInventarioPage(); }, 500);

  } catch (error) {
    console.error('Error al importar desde WhatsApp:', error);
    notificacionInventarioError('Error al importar: ' + error.message);
  }
}

// ============================================
// PARSEAR TEXTO DE INVENTARIO
// ============================================

function parsearTextoInventario(texto) {
  var lineas = texto.split('\n');
  var productosImportados = [];
  var enTabla = false;

  for (var i = 0; i < lineas.length; i++) {
    var linea = lineas[i].trim();
    
    if (!linea) continue;
    
    if (linea.includes('Producto') && linea.includes('Precio') && linea.includes('Cantidad')) {
      enTabla = true;
      continue;
    }
    
    if (enTabla && (linea.startsWith('-') || linea.startsWith('═') || linea.startsWith('🔹'))) {
      break;
    }
    
    if (enTabla) {
      var partes = linea.split('|').map(function(s) { return s.trim(); });
      partes = partes.filter(function(s) { return s.length > 0; });
      
      if (partes.length >= 3) {
        var nombre = partes[0].trim();
        var precioStr = partes[1].trim().replace('$', '').trim();
        var precio = parseFloat(precioStr);
        var stock = parseInt(partes[2].trim()) || 0;
        
        if (nombre && !isNaN(precio) && precio > 0 && !nombre.includes('Producto') && !nombre.includes('─')) {
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

async function eliminarProductoHandler(producto) {
  try {
    await eliminarProducto(producto.id);
    notificacionExito('"' + producto.nombre + '" eliminado');
    renderInventarioPage();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    notificacionError('Error al eliminar: ' + error.message);
  }
}