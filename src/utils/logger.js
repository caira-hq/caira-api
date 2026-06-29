const LOG_LEVELS = { error: 0, warn: 1, info: 2 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info; 

const format = (level, message) => {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] ${message}`;
};

const logger = {
  info: (msg) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.info) console.log(format('info', msg));
  },
  warn: (msg) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.warn) console.warn(format('warn', msg));
  },
  error: (msg) => {
    if (CURRENT_LEVEL >= LOG_LEVELS.error) console.error(format('error', msg));
  },
};

export default logger;
