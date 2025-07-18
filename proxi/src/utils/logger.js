export const logger = {
  info: (...args) => console.log(`[${new Date().toISOString()}]`, ...args),
  error: (...args) => console.error(`[${new Date().toISOString()}]`, ...args),
};

export const stream = {
  write: (message) => logger.info(message.trim()),
};
