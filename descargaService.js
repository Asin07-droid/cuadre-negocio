// src/core/services/descargaService.js
// Servicio de descarga con soporte para WebToApp y verificación de integridad (hash)

// =============================================
// COMPARTIR ARCHIVO (WEB SHARE API — EVITA EL SISTEMA DE DESCARGAS)
// =============================================

/**
 * Comparte un archivo usando el selector nativo de Android (Web Share API).
 * No depende del bridge de WebToApp ni de su sistema de descargas.
 * @param {any} datos - Contenido del archivo, o un Blob ya generado
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipo - Tipo MIME
 * @param {string} tituloCompartir - Título mostrado en el selector nativo
 * @returns {Promise<boolean>} - true si se abrió el selector, false si no está disponible o fue cancelado
 */
export async function compartirArchivo(datos, nombreArchivo, tipo = 'application/json', tituloCompartir = nombreArchivo) {
  try {
    const blob = (datos instanceof Blob) ? datos : new Blob(
      [typeof datos === 'string' ? datos : JSON.stringify(datos, null, 2)],
      { type: tipo }
    );
    const archivo = new File([blob], nombreArchivo, { type: tipo });

    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: tituloCompartir });
      console.log('✅ Compartido con Web Share API');
      return true;
    }
    console.warn('Web Share API con archivos no disponible en este WebView');
    return false;
  } catch (e) {
    // El usuario canceló el selector (AbortError) no es un error real
    if (e.name !== 'AbortError') console.warn('Compartir archivo falló:', e);
    return false;
  }
}

// =============================================
// FUNCIONES DE DESCARGA (BRIDGE + TRADICIONAL)
// =============================================

/**
 * Descarga un archivo usando el puente de WebToApp o método tradicional
 * @param {any} datos - Datos a descargar (objeto o string)
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipo - Tipo MIME (por defecto 'application/json')
 * @returns {boolean} - true si la descarga se inició
 */
export function descargarArchivo(datos, nombreArchivo, tipo = 'application/json') {
  const contenido = typeof datos === 'string' ? datos : JSON.stringify(datos, null, 2);

  // 1. Intentar con WebToApp (nuevo)
  if (window.webtoapp && typeof window.webtoapp.download === 'function') {
    try {
      window.webtoapp.download(contenido, nombreArchivo, tipo);
      console.log('✅ Descarga con WebToApp bridge');
      return true;
    } catch (e) { console.warn('WebToApp bridge falló:', e); }
  }

  // 2. Intentar con WebToApp (legacy)
  if (window.WebToApp && typeof window.WebToApp.download === 'function') {
    try {
      window.WebToApp.download(contenido, nombreArchivo, tipo);
      console.log('✅ Descarga con WebToApp legacy');
      return true;
    } catch (e) { console.warn('WebToApp legacy falló:', e); }
  }

  // 3. Data URI directo (no depende de Blob ni de ningún bridge propietario)
  try {
    const base64 = btoa(unescape(encodeURIComponent(contenido)));
    const dataUri = `data:${tipo};base64,${base64}`;
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ Descarga con Data URI');
    return true;
  } catch (e) { console.warn('Data URI falló:', e); }

  // 4. Método tradicional con Blob (navegador / respaldo final)
  try {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ Descarga con método tradicional (Blob)');
    return true;
  } catch (e) {
    console.error('❌ Error en descarga:', e);
    return false;
  }
}

// =============================================
// GENERAR HASH (SHA-256)
// =============================================

/**
 * Genera un hash SHA-256 a partir de un texto
 * @param {string} texto - Texto a hashear
 * @returns {Promise<string>} - Hash en hexadecimal
 */
export async function generarHash(texto) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error generando hash:', error);
    // Fallback: hash simple para navegadores sin crypto.subtle
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      const char = texto.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

// =============================================
// EXPORTAR CON HASH
// =============================================

/**
 * Exporta datos con hash de verificación
 * @param {any} datos - Datos a exportar
 * @param {string} nombreArchivo - Nombre del archivo
 * @returns {Promise<boolean>} - true si la exportación fue exitosa
 */
export async function exportarConHash(datos, nombreArchivo) {
  try {
    const json = JSON.stringify(datos, null, 2);
    const hash = await generarHash(json);
    
    const paquete = {
      hash: hash,
      datos: datos,
      timestamp: new Date().toISOString(),
      version: '1.5'
    };
    
    return descargarArchivo(paquete, nombreArchivo);
  } catch (error) {
    console.error('Error en exportarConHash:', error);
    return false;
  }
}

// =============================================
// IMPORTAR CON VERIFICACIÓN DE HASH
// =============================================

/**
 * Importa datos verificando el hash de integridad
 * @param {File} file - Archivo JSON a importar
 * @returns {Promise<any>} - Datos importados (si la verificación es exitosa)
 */
export function importarConHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      try {
        const paquete = JSON.parse(e.target.result);
        
        // Verificar estructura
        if (!paquete.hash || !paquete.datos) {
          reject(new Error('El archivo no tiene un formato válido (falta hash o datos)'));
          return;
        }
        
        // Calcular hash de los datos actuales
        const jsonActual = JSON.stringify(paquete.datos, null, 2);
        const hashCalculado = await generarHash(jsonActual);
        
        // Comparar hashes
        if (hashCalculado !== paquete.hash) {
          reject(new Error('⚠️ El archivo ha sido modificado. No se puede importar.'));
          return;
        }
        
        // Verificar versión (opcional)
        if (paquete.version && paquete.version !== '1.5') {
          console.warn('⚠️ Versión del archivo:', paquete.version, ' (esperada: 1.5)');
        }
        
        resolve(paquete.datos);
      } catch (error) {
        reject(new Error('Error al leer el archivo: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

// =============================================
// INVENTARIO EN TEXTO PLANO (EXPORTAR / IMPORTAR)
// =============================================

/**
 * Genera un texto plano legible a partir de una lista de productos.
 * @param {Array} productos - [{nombre, precio, stock, categoria}]
 * @returns {Promise<string>}
 */
export async function generarTextoInventario(productos) {
  const fecha = new Date().toLocaleString('es-CU', { hour: '2-digit', minute: '2-digit' });
  const lineaVerificacion = productos
    .map(p => `${p.nombre}|${p.precio}|${p.stock || 0}|${p.categoria || 'General'}`)
    .join('\n');
  const hashCompleto = await generarHash(lineaVerificacion);
  const codigoVerificacion = hashCompleto.slice(0, 8);

  const lineas = [];
  lineas.push('CUADRE DE NEGOCIO — INVENTARIO');
  lineas.push(`Exportado: ${fecha}`);
  lineas.push(`Total productos: ${productos.length}`);
  lineas.push(`Verificación: ${codigoVerificacion}`);
  lineas.push('========================================');
  productos.forEach((p, i) => {
    lineas.push(`${i + 1}. ${p.nombre}`);
    lineas.push(`   Precio: $${p.precio} | Stock: ${p.stock || 0} | Categoría: ${p.categoria || 'General'}`);
  });
  lineas.push('========================================');

  return lineas.join('\n');
}

/**
 * Parsea el texto plano generado por generarTextoInventario de vuelta a productos.
 * @param {string} texto
 * @returns {Promise<{productos: Array, verificado: boolean}>}
 */
export async function parsearTextoInventario(texto) {
  const limpio = texto.replace(/\r\n/g, '\n');

  const productos = [];
  const regexProducto = /^\d+\.\s+(.+?)\n\s*Precio:\s*\$?([\d.]+)\s*\|\s*Stock:\s*(\d+)\s*\|\s*Categor[ií]a:\s*(.+?)\s*$/gm;
  let match;
  while ((match = regexProducto.exec(limpio)) !== null) {
    productos.push({
      nombre: match[1].trim(),
      precio: parseFloat(match[2]),
      stock: parseInt(match[3], 10),
      categoria: match[4].trim()
    });
  }

  if (productos.length === 0) {
    throw new Error('No se encontraron productos con el formato esperado en el archivo.');
  }

  let verificado = true;
  const matchVerificacion = limpio.match(/Verificaci[oó]n:\s*([a-f0-9]+)/i);
  if (matchVerificacion) {
    const lineaVerificacion = productos
      .map(p => `${p.nombre}|${p.precio}|${p.stock || 0}|${p.categoria || 'General'}`)
      .join('\n');
    const hashCompleto = await generarHash(lineaVerificacion);
    verificado = hashCompleto.slice(0, 8) === matchVerificacion[1].toLowerCase();
  } else {
    verificado = false; // no traía código, no podemos confirmar integridad (pero puede ser válido igual)
  }

  return { productos, verificado };
}



/**
 * Muestra datos JSON en un modal (fallback cuando la descarga falla)
 * @param {any} datos - Datos a mostrar
 * @param {string} titulo - Título del modal
 */
export function mostrarJSON(datos, titulo = '📄 Datos exportados') {
  const json = JSON.stringify(datos, null, 2);
  
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex; justify-content: center; align-items: center;
    z-index: 99999; padding: 20px;
    backdrop-filter: blur(4px);
  `;
  
  overlay.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4);">
      <div style="padding: 16px 20px; border-bottom: 1px solid #E3E6EE; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 17px;">${titulo}</h3>
        <button id="btnCerrarJSON" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748B; min-height: 44px; min-width: 44px;">✖</button>
      </div>
      <div style="padding: 16px 20px; overflow-y: auto; max-height: calc(80vh - 120px);">
        <pre style="background: #F1F2F6; padding: 12px; border-radius: 8px; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; max-height: 300px; overflow-y: auto;">${json}</pre>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <button id="btnCopiarJSON" style="flex: 1; padding: 10px; background: #16213E; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;">📋 Copiar</button>
          <button id="btnDescargarJSON" style="flex: 1; padding: 10px; background: #1F6E43; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; min-height: 44px;">💾 Descargar</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('btnCerrarJSON').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  
  document.getElementById('btnCopiarJSON').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(json);
      alert('📋 Copiado al portapapeles');
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = json;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('📋 Copiado al portapapeles');
    }
  });
  
  document.getElementById('btnDescargarJSON').addEventListener('click', () => {
    descargarArchivo(datos, `exportacion_${new Date().toISOString().slice(0,10)}.json`);
    overlay.remove();
  });
}