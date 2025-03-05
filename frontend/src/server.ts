import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'localstorage-polyfill'; // Polyfill para localStorage en el servidor

// Definir las rutas de las carpetas de distribución
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Configurar el polyfill para localStorage en el entorno del servidor
global['localStorage'] = localStorage;

// Configurar middleware para servir archivos estáticos desde la carpeta de distribución del navegador
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y', // Configuración de caché para optimización
    index: false, // Evita servir el archivo index.html por defecto
    redirect: false, // No redirigir a índices de directorios
  }),
);

// Manejar todas las solicitudes entrantes con Angular Universal para SSR (Server-Side Rendering)
app.use('/**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// Iniciar el servidor si este archivo es el punto de entrada principal
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port);
}

// Exportar el manejador de solicitudes para ser utilizado en otros módulos
export const reqHandler = createNodeRequestHandler(app);
