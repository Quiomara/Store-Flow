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

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Configurar el polyfill para localStorage en el servidor
global['localStorage'] = localStorage; // Hacer que localStorage esté disponible globalmente

// Configurar middleware para servir archivos estáticos
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Manejar todas las solicitudes con Angular Universal
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
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Exportar el manejador de solicitudes para uso en otros módulos
export const reqHandler = createNodeRequestHandler(app);
