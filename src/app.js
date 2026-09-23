'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/api');

/**
 * Crea y configura la aplicación Express como una función factory.
 * Esto permite crear instancias limpias en los tests sin efectos secundarios
 * de arrancar un servidor real (puerto en uso, etc.).
 */
const createApp = () => {
  const app = express();

  // ============================================================
  // Seguridad — Helmet configura headers HTTP defensivos por defecto.
  // CSP personalizado para permitir Three.js desde CDN.
  // ============================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            // Three.js y GSAP via CDN — necesarios para el renderizado 3D
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://unpkg.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            // Google Fonts para la tipografía del diario
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            // Texturas de la luna desde NASA/Three.js assets
            'https://threejs.org',
            'https://www.solarsystemscope.com',
          ],
          connectSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
        },
      },
    })
  );

  // Trust proxy solo en producción — necesario para que rate-limit
  // use la IP real y no la del proxy/load balancer
  if (config.server.trustProxy) {
    app.set('trust proxy', 1);
  }

  // ============================================================
  // CORS — en desarrollo abierto; en producción solo el origen permitido
  // ============================================================
  app.use(
    cors({
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ============================================================
  // Compresión gzip — reduce el tamaño de las respuestas entre 60-80%.
  // Esencial para que las texturas y assets del frontend carguen rápido.
  // ============================================================
  app.use(compression());

  // ============================================================
  // Rate limiting — protege contra bots y abuso.
  // 200 requests por IP en 15 minutos es más que suficiente para uso personal.
  // ============================================================
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Demasiadas solicitudes. Intenta más tarde.',
    },
  });
  app.use('/api', limiter);

  // ============================================================
  // Parseo de body — solo lo necesario, sin overhead de multipart
  // ============================================================
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));

  // ============================================================
  // Logging HTTP
  // ============================================================
  app.use(requestLogger);

  // ============================================================
  // Archivos estáticos del frontend — servidos directamente por Express.
  // En producción un Nginx/CDN debería servir estos, pero para este proyecto
  // mantenerlos aquí simplifica el deployment.
  // ============================================================
  app.use(
    express.static(path.join(__dirname, '..', 'public'), {
      maxAge: config.static.maxAge,
      etag: true,
      lastModified: true,
    })
  );

  // ============================================================
  // Rutas de la API
  // ============================================================
  app.use('/api', apiRoutes);

  // ============================================================
  // SPA fallback — cualquier ruta no-API devuelve el index.html.
  // Necesario para que el routing del frontend funcione en recargas directas.
  // ============================================================
  app.get('*', (req, res) => {
    // Excluye rutas de API del fallback para no ocultar errores 404 de la API
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  // ============================================================
  // Error handler — siempre al final de la cadena de middleware
  // ============================================================
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
