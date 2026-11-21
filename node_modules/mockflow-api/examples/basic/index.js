import { createMockServer } from 'mockflow-api';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = createMockServer({
  port: 4001,
  schema: path.join(__dirname, 'schema.json'),
  prefix: '/api'
});

const info = await server.start();
console.log(`Basic Example server running at http://localhost:${info.port}${info.prefix}/users`);
