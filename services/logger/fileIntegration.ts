import { LoggerIntegration } from "@brainstack/log";
import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve('application.log'); // Specify your log file path here

export const fileIntegration: LoggerIntegration = {
    log: (...message: any[]) => {
        const logMessage = `[LOG] [${new Date().toISOString()}] ` + message.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ');
        fs.appendFileSync(logFilePath, logMessage + '\n');
    },

    info: (...message: any[]) => {
        const logMessage = `[INFO] [${new Date().toISOString()}] ` + message.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ');
        fs.appendFileSync(logFilePath, logMessage + '\n');
    },

    warn: (...message: any[]) => {
        const logMessage = `[WARN] [${new Date().toISOString()}] ` + message.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ');
        fs.appendFileSync(logFilePath, logMessage + '\n');
    },

    error: (...message: any[]) => {
        const logMessage = `[ERROR] [${new Date().toISOString()}] ` + message.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ');
        fs.appendFileSync(logFilePath, logMessage + '\n');
    },

    verbose: (...message: any[]) => {
        const logMessage = `[VERBOSE] [${new Date().toISOString()}] ` + message.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ');
        fs.appendFileSync(logFilePath, logMessage + '\n');
    },
}; 