import express from 'express';
import { resolveConfig } from './config.js';
import { loadSchema } from './schema.js';
import { generateDataset } from '../generators/data-generator.js';
import { InMemoryDatabase } from './database.js';
import { createCrudRouter } from '../routes/crud.js';
import { errorHandler } from '../middleware/error-handler.js';
import { createLogger } from '../middleware/logger.js';

export class MockEngine {
  constructor(options = {}) {
    this.customGenerators = options.customGenerators || {};
    this.config = resolveConfig(options);
    this.database = new InMemoryDatabase({ idType: options.idType || 'integer' });
    this.normalizedSchema = null;
    this.app = null;
    this.server = null;
    this.isRunning = false;
  }

  /**
   * Initializes schema and generates in-memory dataset
   */
  init(schemaInput = null) {
    const rawSchema = schemaInput || this.config.schema;
    this.normalizedSchema = loadSchema(rawSchema, this.customGenerators);
    this.regenerateData();
    this.buildApp();
    return this;
  }

  regenerateData() {
    const dataset = generateDataset(this.normalizedSchema, {
      seed: this.config.seed,
      customGenerators: this.customGenerators,
      idType: this.config.idType
    });
    this.database.loadData(dataset);
  }

  registerGenerator(name, fn) {
    if (typeof fn !== 'function') {
      throw new Error(`Generator '${name}' must be a function`);
    }
    this.customGenerators[name] = fn;
    return this;
  }

  buildApp() {
    const app = express();
    this.app = app;

    // Built-in JSON body parser with safety limit
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));

    // CORS support
    if (this.config.cors) {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
          return res.sendStatus(204);
        }
        next();
      });
    }

    // Logger
    app.use(createLogger(this.config.logLevel));

    // Configurable simulated latency delay
    if (this.config.delay > 0) {
      app.use((req, res, next) => {
        setTimeout(next, this.config.delay);
      });
    }

    const prefix = this.config.prefix ? this.config.prefix.replace(/\/$/, '') : '';

    // Metadata Endpoint: GET /api
    app.get(prefix || '/', (req, res) => {
      const collections = {};
      for (const colName of Object.keys(this.normalizedSchema)) {
        collections[colName] = {
          count: this.database.count(colName),
          endpoint: `${prefix}/${colName}`
        };
      }
      res.json({
        name: 'MockFlow REST API Server',
        status: 'running',
        collections
      });
    });

    // Optional Reset Endpoint
    if (this.config.enableResetEndpoint) {
      app.post(`${prefix}/_reset`, (req, res) => {
        this.regenerateData();
        res.json({ success: true, message: 'Database reset to initial schema state' });
      });
    }

    // Register Collection Routes
    for (const [colName, schemaDef] of Object.entries(this.normalizedSchema)) {
      const crudRouter = createCrudRouter({
  collectionName: colName,
  schemaDef,
  normalizedSchema: this.normalizedSchema,
  database: this.database,
  config: this.config
});
      app.use(`${prefix}/${colName}`, crudRouter);
    }

    // 404 handler for unknown routes
    app.use((req, res) => {
      res.status(404).json({
        error: {
          message: `Endpoint ${req.method} ${req.originalUrl} not found`,
          status: 404,
          code: 'ENDPOINT_NOT_FOUND'
        }
      });
    });

    // Global error handler
    app.use(errorHandler);

    return app;
  }

  async start(portOverride = null) {
    if (!this.app) {
      this.init();
    }

    const port = portOverride || this.config.port;

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          this.isRunning = true;
          this.config.port = port;
          resolve({
            port,
            host: this.config.host,
            prefix: this.config.prefix,
            collections: Object.keys(this.normalizedSchema)
          });
        });

        this.server.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async stop() {
    if (!this.server || !this.isRunning) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) return reject(err);
        this.isRunning = false;
        resolve();
      });
    });
  }

  reset() {
    this.regenerateData();
  }
}

export function createMockServer(options = {}) {
  const engine = new MockEngine(options);
  engine.init();
  return engine;
}
