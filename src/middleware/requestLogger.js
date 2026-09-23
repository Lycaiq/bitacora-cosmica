'use strict';

const morgan = require('morgan');
const logger = require('../utils/logger');

/**
 * Puente entre Morgan (HTTP logger) y Winston (logger de la app).
 * Morgan formatea la línea de log HTTP; Winston decide a dónde va.
 * Separar la preocupación de "qué loguear" de "cómo loguear" es la idea.
 */
const stream = {
  write: message => logger.http(message.trim()),
};

/**
 * En producción solo logueamos requests cortos (combined) para no saturar.
 * En desarrollo usamos dev para ver colores y tiempos de respuesta al instante.
 */
const requestLogger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream,
  // Omite requests de healthcheck para no contaminar los logs con ruido
  skip: (req) => req.url === '/health',
});

module.exports = requestLogger;
