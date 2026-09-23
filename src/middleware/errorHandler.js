'use strict';

const logger = require('../utils/logger');

/**
 * Manejador centralizado de errores de Express.
 * Al tener los 4 parámetros Express lo reconoce automáticamente como error middleware.
 * Centralizar aquí evita duplicar lógica de respuesta de error en cada ruta.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || false;

  // Los errores operacionales (validación, not found, etc.) son esperados.
  // Los errores 5xx no operacionales son bugs reales que hay que investigar.
  if (statusCode >= 500 && !isOperational) {
    logger.error('Error no operacional detectado:', err);
  } else {
    logger.warn(`Error ${statusCode}: ${err.message}`);
  }

  // En producción nunca exponemos el stack trace al cliente
  const response = {
    success: false,
    status: statusCode,
    message: err.message || 'Error interno del servidor',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
