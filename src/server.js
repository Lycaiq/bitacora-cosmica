'use strict';

const http = require('http');
const createApp = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

/**
 * Punto de entrada del proceso Node.js.
 * Aquí solo vivimos el arranque y el apagado graceful del servidor.
 * La lógica de la aplicación vive en app.js.
 */

const app = createApp();
const server = http.createServer(app);

// ============================================================
// Manejo de errores del servidor HTTP
// ============================================================
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    // Error común en desarrollo cuando ya hay algo corriendo en el puerto
    logger.error(`Puerto ${config.server.port} ya está en uso. Detén el proceso anterior.`);
  } else {
    logger.error('Error en el servidor HTTP:', err);
  }
  process.exit(1);
});

// ============================================================
// Arranque del servidor
// ============================================================
server.listen(config.server.port, () => {
  logger.info(`Servidor corriendo en http://localhost:${config.server.port}`);
  logger.info(`Entorno: ${config.server.env}`);
  logger.info('La bitácora está abierta. La luna te espera.');
});

// ============================================================
// Apagado graceful — cierra conexiones activas antes de matar el proceso.
// Sin esto, las requests en vuelo se cortan abruptamente.
// ============================================================
const gracefulShutdown = signal => {
  logger.info(`Señal ${signal} recibida. Cerrando servidor...`);
  server.close(err => {
    if (err) {
      logger.error('Error al cerrar el servidor:', err);
      process.exit(1);
    }
    logger.info('Servidor cerrado limpiamente.');
    process.exit(0);
  });

  // Si después de 10 segundos no cierra solo, forzamos la salida
  setTimeout(() => {
    logger.error('Cierre forzado por timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Captura errores de promesas no manejadas — evita que el proceso muera en silencio
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', { reason, promise });
});

process.on('uncaughtException', err => {
  logger.error('Excepción no capturada:', err);
  // Una excepción no capturada deja el proceso en estado desconocido — mejor reiniciar
  process.exit(1);
});

module.exports = server;
