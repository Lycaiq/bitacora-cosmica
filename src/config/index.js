'use strict';

/**
 * Centraliza toda la configuración del servidor en un único lugar.
 * Leer desde process.env aquí evita que los módulos internos dependan
 * directamente de variables de entorno — más fácil de testear y de cambiar.
 */

require('dotenv').config();

const config = {
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    // En producción el trust proxy es clave para que rate-limit funcione bien detrás de Nginx
    trustProxy: process.env.NODE_ENV === 'production',
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  cors: {
    // En desarrollo permitimos cualquier origen; en producción se restringe al dominio real
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  rateLimit: {
    // Ventana de 15 minutos con máximo de 200 requests — suficiente para uso personal
    windowMs: 15 * 60 * 1000,
    max: 200,
  },

  static: {
    // Cache de archivos estáticos: 1 día en producción, sin cache en desarrollo
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
  },
};

module.exports = config;
