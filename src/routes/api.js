'use strict';

const { Router } = require('express');
const router = Router();

/**
 * Ruta de salud del servidor.
 * Es el endpoint más simple posible, usado por monitores, load balancers
 * y tests de integración para confirmar que el proceso está vivo.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/**
 * Información básica de la API.
 * Útil para saber desde el cliente qué versión está corriendo.
 */
router.get('/info', (_req, res) => {
  res.status(200).json({
    success: true,
    name: 'bitacora-cosmica',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
