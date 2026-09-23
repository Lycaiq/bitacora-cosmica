'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const config = require('../config');

/**
 * Formato legible en desarrollo: timestamp + nivel + mensaje.
 * En producción se puede cambiar a JSON para ingestarlo en un sistema de logs.
 */
const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  // Muestra el stack trace completo solo si hay un error real
  return stack ? `${ts} [${level}]: ${message}\n${stack}` : `${ts} [${level}]: ${message}`;
});

const logger = createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.server.env === 'development' ? combine(colorize(), devFormat) : format.json()
  ),
  transports: [
    new transports.Console(),
    // Archivo de errores separado — solo errores críticos para no inundar el log general
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      // Rota cuando llega a 5MB para no crecer indefinidamente
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
  // Sin esto, una excepción no capturada mata el proceso en silencio
  exitOnError: false,
});

module.exports = logger;
