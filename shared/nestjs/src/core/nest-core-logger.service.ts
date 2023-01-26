import { createLogger, LogLevels, RootLogger } from '@elunic/logger';
import { LoggerService } from '@nestjs/common';

export class NestCoreLogger implements LoggerService {
  private rootLogger: RootLogger;

  constructor() {
    this.rootLogger = createLogger('nest-core', {
      consoleLevel: (process.env.LOG_LEVEL || 'info') as LogLevels,
    });
  }

  log(message: string): void {
    this.rootLogger.info(message);
  }

  error(message: string, trace: string): void {
    this.rootLogger.error(message, trace);
  }

  warn(message: string): void {
    this.rootLogger.warn(message);
  }

  debug(message: string): void {
    this.rootLogger.debug(message);
  }

  verbose(message: string): void {
    this.rootLogger.trace(message);
  }
}
