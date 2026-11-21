/**
 * Lightweight request logger middleware.
 */
export function createLogger(logLevel = 'info') {
  return function loggerMiddleware(req, res, next) {
    if (logLevel === 'none') {
      return next();
    }

    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
      const reset = '\x1b[0m';

      if (logLevel === 'debug' || logLevel === 'info') {
        console.log(`[MockFlow] ${method} ${originalUrl} ${statusColor}${status}${reset} - ${duration}ms`);
      }
    });

    next();
  };
}
