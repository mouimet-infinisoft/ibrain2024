import { FileSystemProvider } from './file.system.provider';
import { LoggerService } from '../../../../logger/logger.service';
import { FileSystemProviderLoadInput, FileSystemProviderLoadOutput } from './file.system.provider.types';
import fs from 'fs';

jest.mock('fs');

describe('FileSystemProvider', () => {
    let provider: FileSystemProvider;
    let logger: LoggerService;

    beforeEach(() => {
        // logger = new LoggerService();
        logger = { info: jest.fn(), verbose: jest.fn(), warn: jest.fn(), error: jest.fn() } as unknown as LoggerService;
        // logger.seLogLevel(LogLevel.VERBOSE)
        provider = new FileSystemProvider(logger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should load files correctly in list mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'list',
                    files: ['file1.txt', 'file2.txt'],
                    includeContent: true
                }
            ]
        };

        (fs.readFileSync as jest.Mock).mockImplementation((file: string) => `Content of ${file}`);

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([
            { path: 'file1.txt', type: '.txt', content: 'Content of file1.txt' },
            { path: 'file2.txt', type: '.txt', content: 'Content of file2.txt' }
        ]);
        expect(logger.info).toHaveBeenCalledWith('Load method called with inputArgs:', inputArgs);
    });

    it('should handle invalid source for list mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'list',
                    // @ts-ignore
                    files: null // Invalid input
                }
            ]
        };

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([]);
        expect(logger.warn).toHaveBeenCalledWith('Invalid source for list mode:', inputArgs.sources[0]);
    });

    it('should load files correctly in path mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'path',
                    basePath: '/some/base/path',
                    recursive: false,
                    includeContent: true
                }
            ]
        };

        (fs.readdirSync as jest.Mock).mockReturnValue([{ name: 'file1.txt', path: "/some/base/path", isFile: () => true }, { path: "/some/base/path", name: 'file2.txt', isFile: () => true }]);
        (fs.readFileSync as jest.Mock).mockImplementation((file: string) => `Content of ${file}`);

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([
            { path: '/some/base/path/file1.txt', type: '.txt', content: 'Content of /some/base/path/file1.txt' },
            { path: '/some/base/path/file2.txt', type: '.txt', content: 'Content of /some/base/path/file2.txt' }
        ]);
    });

    it('should include files from math pattern in path mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'path',
                    basePath: '/some/base/path',
                    recursive: false,
                    includeContent: true,
                    matchPattern: "file1"
                }
            ]
        };

        (fs.readdirSync as jest.Mock).mockReturnValue([{ name: 'file1.txt', path: "/some/base/path", isFile: () => true }, { path: "/some/base/path", name: 'file2.txt', isFile: () => true }]);
        (fs.readFileSync as jest.Mock).mockImplementation((file: string) => `Content of ${file}`);

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([
            { path: '/some/base/path/file1.txt', type: '.txt', content: 'Content of /some/base/path/file1.txt' }
        ]);
    });

    it('should exclude files from exclude pattern in path mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'path',
                    basePath: '/some/base/path',
                    recursive: false,
                    includeContent: true,
                    excludePattern: "file2"
                }
            ]
        };

        (fs.readdirSync as jest.Mock).mockReturnValue([{ name: 'file1.txt', path: "/some/base/path", isFile: () => true }, { path: "/some/base/path", name: 'file2.txt', isFile: () => true }]);
        (fs.readFileSync as jest.Mock).mockImplementation((file: string) => `Content of ${file}`);

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([
            { path: '/some/base/path/file1.txt', type: '.txt', content: 'Content of /some/base/path/file1.txt' }
        ]);
    });

    it('should add files without content in path mode', () => {
        const inputArgs: FileSystemProviderLoadInput = {
            sources: [
                {
                    mode: 'path',
                    basePath: '/some/base/path',
                    recursive: false,
                    includeContent: false
                }
            ]
        };

        (fs.readdirSync as jest.Mock).mockReturnValue([{ name: 'file1.txt', path: "/some/base/path", isFile: () => true }, { path: "/some/base/path", name: 'file2.txt', isFile: () => true }]);

        const result: FileSystemProviderLoadOutput = provider.load(inputArgs);

        expect(result).toEqual([
            { path: '/some/base/path/file1.txt', type: '.txt' },
            { path: '/some/base/path/file2.txt', type: '.txt' }
        ]);
    });


});