# Proyecto Final Backend I – Coderhouse

Aplicación e-commerce desarrollada con Node.js, Express, MongoDB (Mongoose), Handlebars y Socket.IO. Incluye:

- API de productos con filtros, paginación, ordenamiento y listado de categorías.
- API de carritos con operaciones avanzadas (crear, agregar, reemplazar, actualizar, vaciar, eliminar ítems) usando `populate`.
- Vistas Handlebars para productos, carritos poblados y realtime con Socket.IO.
- Scripts y assets en `src/public` para manejar formularios, filtros y manejo de carrito.

## Requisitos previos

- Node.js 18+
- Acceso a una instancia de MongoDB (Atlas u on-premise)

## Configuración de entorno

1. Copiá el archivo `.env.example` a `.env` en la raíz del proyecto.
2. Completá las variables con tus credenciales reales:
   - `PORT`: puerto donde se expondrá la app (por defecto 8080).
   - `MONGODB_URI`: cadena de conexión de Mongo (incluye usuario y contraseña).
   - `MONGODB_DBNAME`: base de datos a utilizar.

## Instalación

```powershell
cd "c:\Users\Usuario\OneDrive\Escritorio\ENTREGA FINAL BACKEND I"
npm install
```

## Poblar datos de ejemplo

El script `src/scripts/seedProducts.js` crea/actualiza un set de productos para probar paginación y vistas.

```powershell
node src/scripts/seedProducts.js
```

## Ejecutar el servidor

```powershell
npm run start
```

Para desarrollo con recarga automática podés usar:

```powershell
npm run dev
```

La aplicación quedará disponible en `http://localhost:8080` (o el puerto que definas en `PORT`).

## Notas adicionales

- El flujo del carrito se apoya en `localStorage` para persistir el `cid` y crea carritos automáticamente desde la UI cuando no existe uno.
- `src/public/js/cart.js`, `layout.js`, `products.js` y `realtime.js` manejan la interacción del cliente (filtros, botones, sockets, etc.).
- Los profesores pueden solicitar las credenciales de MongoDB; compartilas fuera del repositorio (por mensaje privado en la entrega o correo) para mantener buenas prácticas de seguridad.
