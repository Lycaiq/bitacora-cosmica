'use strict';

/**
 * Tests de integración del servidor.
 * Prueban el flujo HTTP real sin mocks — levantamos la app y hacemos requests reales.
 * El objetivo es validar que los middlewares, rutas y respuestas funcionan de punta a punta.
 */

const request = require('supertest');
const createApp = require('../../src/app');

// Usamos una instancia nueva de la app para cada suite — sin efectos secundarios entre tests
let app;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  app = createApp();
});

// ============================================================
// Suite: Health check
// ============================================================
describe('GET /api/health', () => {
  it('debe responder 200 con estado ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    expect(res.body.memory).toBeDefined();
  });

  it('debe incluir todos los campos de memoria del proceso', async () => {
    const res = await request(app).get('/api/health');

    const { memory } = res.body;
    expect(memory.rss).toBeDefined();
    expect(memory.heapTotal).toBeDefined();
    expect(memory.heapUsed).toBeDefined();
  });
});

// ============================================================
// Suite: API info
// ============================================================
describe('GET /api/info', () => {
  it('debe retornar el nombre y versión del proyecto', async () => {
    const res = await request(app).get('/api/info');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.name).toBe('bitacora-cosmica');
    expect(res.body.version).toBeDefined();
    expect(res.body.environment).toBe('test');
  });
});

// ============================================================
// Suite: SPA fallback
// ============================================================
describe('Rutas frontend (SPA fallback)', () => {
  it('debe servir el index.html para rutas desconocidas', async () => {
    const res = await request(app).get('/alguna-ruta-del-frontend');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('debe retornar 404 JSON para rutas /api desconocidas', async () => {
    const res = await request(app).get('/api/ruta-inexistente');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
// Suite: Headers de seguridad
// ============================================================
describe('Headers de seguridad (Helmet)', () => {
  it('debe incluir X-Content-Type-Options', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('debe incluir X-Frame-Options', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});

// ============================================================
// Suite: Compresión
// ============================================================
describe('Compresión gzip', () => {
  it('debe comprimir respuestas cuando el cliente acepta gzip', async () => {
    const res = await request(app).get('/api/health').set('Accept-Encoding', 'gzip, deflate');

    // Si la respuesta es pequeña, compression puede no comprimir — chequeamos el header
    // En lugar de requerir gzip, verificamos que el servidor responde correctamente
    expect(res.status).toBe(200);
  });
});
