# 📊 Cuadre de Negocio - Sistema de Gestión de Ventas

Sistema profesional de cuadre diario para negocios, con gestión de inventario, historial de turnos y exportación de reportes.

![Versión](https://img.shields.io/badge/version-1.5.0-blue)
![Estado](https://img.shields.io/badge/status-estable-green)
![Plataforma](https://img.shields.io/badge/platform-web%20%7C%20mobile-lightgrey)

## 📋 Descripción

**Cuadre de Negocio** es una aplicación web diseñada para pequeños y medianos negocios que necesitan llevar un control preciso de sus ventas diarias, inventario y cierre de turnos. Con una interfaz intuitiva y optimizada para móviles, permite registrar productos, contar efectivo, generar reportes y mantener un historial completo de operaciones.

### 🎯 Características Principales

- ✅ **Cuadre Diario**: Registro de ventas por producto con conteo de inicial/final
- ✅ **Gestión de Billetes**: Conteo de efectivo por denominación
- ✅ **Transferencias**: Registro de pagos electrónicos
- ✅ **Comparador en Tiempo Real**: Visualización instantánea de diferencias
- ✅ **Inventario**: Gestión completa de productos (CRUD)
- ✅ **Historial**: Registro histórico de todos los turnos cerrados
- ✅ **Exportación**: Generación de reportes en PDF
- ✅ **WhatsApp**: Envío de reportes resumidos por WhatsApp
- ✅ **Swipe Navigation**: Navegación intuitiva entre secciones
- ✅ **Sistema de Licencias**: Control de acceso por tiempo limitado
- ✅ **Persistencia Local**: Datos guardados en IndexedDB
- ✅ **Exportación/Importación**: Backup y restauración de inventario con hash de verificación

## 🚀 Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|------------|---------|-----|
| JavaScript (ES6+) | - | Lógica de la aplicación |
| IndexedDB | - | Almacenamiento local persistente |
| CSS3 | - | Estilos y animaciones |
| HTML5 | - | Estructura de la interfaz |
| jsPDF | 2.5.1 | Generación de reportes PDF |
| html2canvas | 1.4.1 | Captura de pantalla para PDF |

## 📁 Estructura del Proyecto
src/
├── app.js # Punto de entrada principal
├── core/
│ ├── services/
│ │ ├── licenciaService.js # Sistema de licencias
│ │ ├── notificacionService.js # Sistema de notificaciones
│ │ ├── pdfService.js # Generación de PDF
│ │ └── descargaService.js # Exportación/Importación
│ └── utils/
│ └── validators.js # Validaciones
├── ui/
│ ├── pages/
│ │ ├── CuadrePage.js # Página principal de cuadre
│ │ ├── HistorialPage.js # Historial de turnos
│ │ └── InventarioPage.js # Gestión de inventario
│ ├── styles/
│ │ ├── main.css # Estilos principales
│ │ └── components.css # Estilos de componentes
│ └── assets/
│ └── logo-tecnoroutev.png # Logo de la aplicación
├── infrastructure/
│ └── indexeddb/
│ ├── db.js # Configuración de IndexedDB
│ ├── turnosRepository.js # CRUD de turnos
│ └── productosRepository.js # CRUD de productos
└── shared/
└── constants/
└── denominaciones.js # Constantes de billetes


## 🛠️ Instalación y Configuración

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Node.js (opcional, para desarrollo)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/cuadre-negocio.git
cd cuadre-negocio

📱 Uso de la Aplicación
1. Cuadre Diario

    Seleccionar Turno: Día ☀️ o Noche 🌙

    Ingresar Dependiente: Nombre del responsable

    Agregar Productos:

        Manualmente con el botón "Agregar"

        Desde inventario con "Cargar del Inventario"

    Registrar Ventas:

        Producto: nombre del artículo

        Precio: valor unitario

        Inicial: cantidad al inicio del turno

        Final: cantidad al final del turno

    Contar Billetes: Ingresar cantidad por denominación

    Registrar Transferencias: Monto de pagos electrónicos

    Revisar Comparador: Verifica diferencias en tiempo real

    Acciones:

        🔒 Cerrar Turno: Guarda y finaliza el turno

        🔄 Nuevo Turno: Reinicia el cuadre

        📄 Generar PDF: Crea reporte detallado

        📲 Enviar WhatsApp: Reporte resumido

2. Historial

    Visualiza todos los turnos cerrados

    Filtra por turno (Día/Noche)

    Ver detalles de cada turno

    Eliminar turnos individuales o todos

3. Inventario

    Agregar Producto: Nuevo producto con nombre, precio y stock

    Editar Producto: Modificar datos existentes

    Eliminar Producto: Remover del inventario

    Exportar: Descargar inventario en JSON con hash de verificación

    Importar: Restaurar inventario desde archivo JSON

🔒 Sistema de Licencias
Modos de Operación
Estado	Descripción	Acciones
🟢 Prueba	Período de 3 días gratis	Todas las funciones disponibles
🟡 Activada	Licencia válida por 30 días	Todas las funciones disponibles
🔴 Bloqueada	Licencia expirada	Solo pantalla de activación
Activación de Licencia

    Ingresar la contraseña de verificación en la pantalla de bloqueo

    La licencia se activará por 30 días adicionales

    El contador de días se actualiza automáticamente

👨‍💻 Desarrollador
Marco Antonio Asin Lopez
📱 WhatsApp: +53 52776644
🙏 Agradecimientos

    A todos los usuarios que confían en esta herramienta para su negocio

    A la comunidad de código abierto por las librerías utilizadas
