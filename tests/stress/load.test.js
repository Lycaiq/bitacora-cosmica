'use strict';

/**
 * Prueba de estrés del servidor usando autocannon.
 * El objetivo no es medir velocidad, sino detectar memory leaks.
 * Si el heap crece indefinidamente bajo carga sostenida, hay un leak.
 *
 * Configuración: 10 conexiones concurrentes durante 10 segundos.
 * Estos valores son intencionalmente conservadores para CI — en un
 * entorno de staging puedes subir a 100 conexiones y 30 segundos.
 */

const autocannon = require('autocannon');
const http = require('http');
const createApp = require('../../src/app');

let server;
let serverPort;

beforeAll(done => {
  process.env.NODE_ENV = 'test';
  const app = createApp();

  server = http.createServer(app);
  // Puerto 0 → el SO asigna uno libre, evita conflictos en CI
  server.listen(0, () => {
    serverPort = server.address().port;
    done();
  });
});

afterAll(done => {
  server.close(done);
});

// ============================================================
// Test: throughput mínimo bajo carga
// ============================================================
describe('Prueba de carga básica', () => {
  it('debe mantener latencia media por debajo de 200ms bajo carga moderada', async () => {
    const result = await autocannon({
      url: `http://localhost:${serverPort}/api/health`,
      connections: 10,
      duration: 10,
      // Sin pipelining para simular clientes reales
      pipelining: 1,
    });

    // La latencia media debe estar por debajo de 200ms
    // Si está por encima, hay un bottleneck que investigar
    expect(result.latency.mean).toBeLessThan(200);

    // Debe haber completado al menos 50 requests (si el servidor responde)
    expect(result.requests.sent).toBeGreaterThan(50);

    // Sin errores de conexión — si los hay, hay un memory leak o crash
    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
  }, 20000); // Timeout del test mayor que la duración de la prueba
});

// ============================================================
// Test: estabilidad de memoria bajo carga
// ============================================================
describe('Estabilidad de memoria (detección de leaks)', () => {
  it('no debe crecer el heap de forma ilimitada bajo carga sostenida', async () => {
    const heapBefore = process.memoryUsage().heapUsed;

    // Carga sostenida moderada
    await autocannon({
      url: `http://localhost:${serverPort}/api/health`,
      connections: 20,
      duration: 8,
    });

    // Forzamos el GC si está disponible (node --expose-gc)
    if (global.gc) {
      global.gc();
    }

    const heapAfter = process.memoryUsage().heapUsed;
    const heapGrowthMB = (heapAfter - heapBefore) / 1024 / 1024;

    // Crecimiento mayor a 50MB después de GC es señal de leak
    expect(heapGrowthMB).toBeLessThan(50);
  }, 25000);
});
