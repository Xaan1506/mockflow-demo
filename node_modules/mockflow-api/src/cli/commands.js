import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_SCHEMA_TEMPLATE } from './templates.js';
import { createMockServer } from '../core/engine.js';
import { loadSchema } from '../core/schema.js';
import { generateDataset } from '../generators/data-generator.js';

export function initCommand(options = {}) {
  const targetFile = options.config || 'mockflow.json';
  const filePath = path.resolve(process.cwd(), targetFile);

  if (fs.existsSync(filePath) && !options.force) {
    console.warn(`\x1b[33m[MockFlow] Configuration file already exists at ${targetFile}.\x1b[0m`);
    console.log('Use --force to overwrite.');
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(DEFAULT_SCHEMA_TEMPLATE, null, 2), 'utf-8');
  console.log(`\x1b[32m✔ Initialized new MockFlow schema at: ${targetFile}\x1b[0m`);
  console.log('\nTo start your mock REST API server, run:');
  console.log(`  \x1b[36mnpx mockflow start\x1b[0m`);
}

export async function startCommand(options = {}) {
  const configFile = options.config || 'mockflow.json';
  const schemaPath = path.resolve(process.cwd(), configFile);

  if (!fs.existsSync(schemaPath)) {
    console.error(`\x1b[31m[MockFlow Error] Schema file not found: ${configFile}\x1b[0m`);
    console.log('Run `mockflow init` to generate a starter schema.');
    process.exit(1);
  }

  const port = options.port ? parseInt(options.port, 10) : 3000;
  const delay = options.delay ? parseInt(options.delay, 10) : 0;
  const seed = options.seed ? parseInt(options.seed, 10) : undefined;
  const prefix = options.prefix || '/api';

  try {
    const server = createMockServer({
      schema: schemaPath,
      port,
      delay,
      seed,
      prefix,
      logLevel: 'info',
      enableResetEndpoint: true
    });

    const info = await server.start();

    console.log('\n\x1b[32m🚀 MockFlow API Server is running!\x1b[0m');
    console.log(`\x1b[1mBase URL:\x1b[0m  http://localhost:${info.port}${info.prefix}`);
    console.log(`\x1b[1mMetadata:\x1b[0m  http://localhost:${info.port}${info.prefix}`);
    console.log('\n\x1b[1mAvailable Endpoints:\x1b[0m');

    for (const col of info.collections) {
      console.log(`  \x1b[36mhttp://localhost:${info.port}${info.prefix}/${col}\x1b[0m (GET, POST, PUT, PATCH, DELETE)`);
    }

    console.log('\n\x1b[90mPress Ctrl+C to terminate the server.\x1b[0m\n');

    const handleExit = async () => {
      console.log('\n[MockFlow] Shutting down gracefully...');
      await server.stop();
      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);
  } catch (err) {
    console.error(`\x1b[31m[MockFlow Error] Failed to start server:\x1b[0m ${err.message}`);
    process.exit(1);
  }
}

export function generateCommand(options = {}) {
  const configFile = options.config || 'mockflow.json';
  const schemaPath = path.resolve(process.cwd(), configFile);

  if (!fs.existsSync(schemaPath)) {
    console.error(`\x1b[31m[MockFlow Error] Schema file not found: ${configFile}\x1b[0m`);
    process.exit(1);
  }

  try {
    const normalized = loadSchema(schemaPath);
    const data = generateDataset(normalized, { seed: options.seed });
    const outputFile = options.output || 'mockflow-data.json';
    fs.writeFileSync(path.resolve(process.cwd(), outputFile), JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\x1b[32m✔ Sample data generated successfully to: ${outputFile}\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31m[MockFlow Error] Failed to generate data:\x1b[0m ${err.message}`);
    process.exit(1);
  }
}

export function resetCommand(_options = {}) {
  console.log('\x1b[32m✔ In-memory database will be regenerated whenever server restarts or via POST /api/_reset\x1b[0m');
}
