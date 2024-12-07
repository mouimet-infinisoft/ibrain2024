import { createLogger, consoleIntegration, LogLevel } from '@brainstack/log';
import { fileIntegration } from './fileIntegration'; // Import the file integration
import { Service } from '@brainstack/inject';

export interface ILoggerService {
    log(...message: any[]): void;
    info(...message: any[]): void;
    warn(...message: any[]): void;
    error(...message: any[]): void;
    verbose(...message: any[]): void;
    seLogLevel(logLevel: LogLevel): void;
}

@Service
export class LoggerService implements ILoggerService {
    private logger;

    constructor() {
        this.logger = createLogger(LogLevel.ERROR, [consoleIntegration, fileIntegration]);
    }

    seLogLevel(logLevel: LogLevel) {
        this.logger.changeLogLevel(logLevel)
    }

    log(...message: any[]): void {
        this.logger.log(message);
    }

    info(...message: any[]): void {
        this.logger.info(message);
    }

    warn(...message: any[]): void {
        this.logger.warn(message);
    }

    error(...message: any[]): void {
        this.logger.error(message);
    }

    verbose(...message: any[]): void {
        this.logger.verbose(message);
    }
}
