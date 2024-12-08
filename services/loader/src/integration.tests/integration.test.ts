import { getInstance } from "@brainstack/inject";
import { DataLoaderService } from "../data.loader.service";
import { LogLevel } from "@brainstack/log"
import fs from "fs"; // Import the file system module
import path from 'path' // Import path module
import { DataLoaderRegistry } from "../registry/data.loader.registry";
import { FileSystemProvider } from "../providers/filesystem/file.system.provider";
import { FileSystemProviderLoadInput } from "../providers/filesystem/file.system.provider.types";
import { scenarios } from "./scenarios";
import { LoggerService } from "../../../logger/logger.service";


describe('FileSystemProvider Integration Tests (Comprehensive)', () => {
    let service: DataLoaderService;
    let registry: DataLoaderRegistry;
    let logger: LoggerService;


    beforeEach(() => {
        registry = new DataLoaderRegistry();
        logger = new LoggerService()
        // logger.seLogLevel(LogLevel.VERBOSE)
        registry.registerProvider("filesystem", getInstance(FileSystemProvider));
        service = new DataLoaderService(registry, logger);
    });

    scenarios.forEach((scenario) => {

        describe(scenario.description, () => {
            let tempDir: string;
            let input: FileSystemProviderLoadInput

            beforeEach(() => {
                tempDir = path.join(process.cwd(), fs.mkdtempSync('test_data_'));
                fs.mkdirSync(path.dirname(tempDir), { recursive: true });

                // Create files and folders using absolute paths based on tempDir:
                if (scenario.setup && scenario.setup.files) {
                    scenario.setup.files.forEach((file: any) => {
                        const filePath = path.join(tempDir, file.path); // Correct absolute path
                        fs.mkdirSync(path.dirname(filePath), { recursive: true });
                        fs.writeFileSync(filePath, file.content);
                    });
                }

                // Creating folders
                if (scenario.setup && scenario.setup.folders) {
                    scenario.setup.folders.forEach((folder: any) => {
                        const folderPath = path.join(tempDir, folder);
                        fs.mkdirSync(folderPath, { recursive: true });
                    });
                }

                // Replace {tempDir} placeholder with the ABSOLUTE path
                input = JSON.parse(JSON.stringify(scenario.input).replace(/{tempDir}/g, tempDir));

                scenario.expected = JSON.parse(JSON.stringify(scenario.expected || {}).replace(/{tempDir}/g, tempDir));

            });

            afterEach(() => {
                try {
                    fs.rmSync(tempDir, { recursive: true });
                } catch (err) {
                    // For node versions < 14.14
                    fs.rmdirSync(tempDir, { recursive: true });
                }
            });

            it('should load files correctly', () => {
                try {
                    const result = service.load('filesystem', input);
                    expect(result).toEqual(scenario.expected);
                } catch (error) {
                    if (scenario.error) {
                        expect(`${error}`).toEqual(scenario.error);
                    } else {
                        throw error;
                    }
                }
            });
        });
    });
});

