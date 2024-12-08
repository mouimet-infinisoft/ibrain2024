import { DataLoaderService } from './data.loader.service';
import { DataLoaderRegistry } from './registry/data.loader.registry';
import { LoggerService } from '../../logger/logger.service';
import { IFileSystemProvider, IGitProvider, TProviderId } from './providers/provider.types';
import { FileSystemProviderLoadInput } from './providers/filesystem/file.system.provider.types';
import { GitProviderLoadInput } from './providers/git/git.provider.types';

describe('DataLoaderService', () => {
    let service: DataLoaderService;
    let registry: DataLoaderRegistry;
    let logger: LoggerService;


    beforeEach(() => {
        registry = new DataLoaderRegistry();
        logger = {
            info: jest.fn(),
            error: jest.fn()
        } as unknown as LoggerService; // Mock logger
        service = new DataLoaderService(registry, logger);
    });

    it('should load data from the filesystem provider', async () => {
        const mockFileSystemProvider: IFileSystemProvider = {
            id: "filesystem",
            load: jest.fn().mockResolvedValue("filesystem_data")
        };
        registry.registerProvider("filesystem", mockFileSystemProvider);

        const result = await service.load("filesystem", { sources: [] } as FileSystemProviderLoadInput);
        expect(result).toBe("filesystem_data");
        expect(mockFileSystemProvider.load).toHaveBeenCalledWith({ sources: [] });
        expect(logger.info).toHaveBeenCalledWith('Load provider id: ', 'filesystem', ' with input arguments: ', { sources: [] });

    });


    it('should load data from the git provider', async () => {
        const mockGitProvider: IGitProvider = {
            id: "git",
            load: jest.fn().mockResolvedValue("git_data")
        };
        registry.registerProvider("git", mockGitProvider);

        const result = await service.load("git", { repo: "test_repo" } as GitProviderLoadInput);


        expect(result).toBe("git_data");
        expect(mockGitProvider.load).toHaveBeenCalledWith({ repo: "test_repo" });
        expect(logger.info).toHaveBeenCalledWith('Load provider id: ', 'git', ' with input arguments: ', { repo: "test_repo" });

    });



    it('should throw an error if the provider is not registered', async () => {
        expect(() => {
            service.load("unknown" as unknown as TProviderId, {} as any)
        }).toThrow("No provider registered with id: unknown");
    });



    it('should throw an error for an unexpected provider id (even if registered)', () => {

        const mockInvalidProvider = {
            id: "invalid",
            load: jest.fn(),
        };
        registry.registerProvider("invalid" as any, mockInvalidProvider as any); // using any for testing purposes

        expect(() => {
            service.load("invalid" as any, { some: 'input' } as any);
        }).toThrow("Unexpected provider id: invalid");

    });


});
