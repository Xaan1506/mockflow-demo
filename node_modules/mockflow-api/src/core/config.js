import path from 'node:path';

export const DEFAULT_CONFIG = {
  port: 3000,
  host: 'localhost',
  prefix: '/api',
  schema: './mockflow.json',
  delay: 0,
  cors: true,
  logLevel: 'info', // 'none' | 'error' | 'info' | 'debug'
  seed: undefined,
  enableResetEndpoint: false,
  maxPaginationLimit: 100,
  defaultPaginationLimit: 10
};

export function resolveConfig(options = {}) {
  const merged = { ...DEFAULT_CONFIG, ...options };

  if (typeof merged.port === 'string') {
    merged.port = parseInt(merged.port, 10);
  }

  if (merged.schema && typeof merged.schema === 'string') {
    if (!path.isAbsolute(merged.schema)) {
      merged.schema = path.resolve(process.cwd(), merged.schema);
    }
  }

  return merged;
}
