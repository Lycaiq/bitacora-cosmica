import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    // Aplica a todo el código fuente del servidor
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "writable",
        exports: "writable",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Buffer: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly"
      }
    },
    rules: {
      // Evita variables declaradas pero nunca usadas — síntoma de código muerto
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // Obliga a manejar errores explícitamente en callbacks asincrónicos
      "no-undef": "error",
      // Prefiere const para todo lo que no muta — señal de intención clara
      "prefer-const": "error",
      // Detecta comparaciones que deberían ser estrictas
      "eqeqeq": ["error", "always"],
      // Un retorno por función hace el flujo predecible
      "consistent-return": "error",
      // Evita el uso de var — relicto de otra era
      "no-var": "error",
      // Funciones de flecha cuando el contexto no importa
      "prefer-arrow-callback": "warn",
      // Evita console.log en producción (usa el logger)
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  {
    // Los archivos de config raíz usan módulos ES, los ignoramos del linting estricto
    ignores: ["node_modules/", "coverage/", "dist/", "public/"]
  }
];
