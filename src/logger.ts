import { createLogger, transports, format } from 'winston';
import morgan from 'morgan';

const accessLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: './logs/access-logs.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ]
});

const httpStream = {
  write: (message: string) => accessLogger.info(message.substring(0, message.lastIndexOf('\n')))
};


export const httpLogger = morgan(
  'common',
  { stream: httpStream }
)

const defaultLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: './logs/app-logs.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new transports.Console(),
  ]
})

export const logger = (filename: string) => {
  return {
    info: (text: string) => defaultLogger.info(`${filename}: ${text}`)
  }
}