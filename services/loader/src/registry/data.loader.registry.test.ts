import { DataLoaderRegistry } from './data.loader.registry';
import { IFileSystemProvider, IGitProvider, TDataLoaderProvider } from '../providers/provider.types';


describe('DataLoaderRegistry', () => {
    let registry: DataLoaderRegistry;

    beforeEach(() => {
        registry = new DataLoaderRegistry();
    });


    it('should register and retrieve a FileSystemProvider', () => {
        const fileSystemProvider: IFileSystemProvider = {
            id: "filesystem",
            load: jest.fn().mockResolvedValue([]) // Mock the load function
        };

        registry.registerProvider("filesystem", fileSystemProvider);
        const retrievedProvider = registry.getProvider("filesystem");

        expect(retrievedProvider).toBe(fileSystemProvider);
    });


    it('should register and retrieve a GitProvider', () => {
        const gitProvider: IGitProvider = {
            id: "git",
            load: jest.fn().mockResolvedValue([]) // Mock the load function
        };

        registry.registerProvider("git", gitProvider);
        const retrievedProvider = registry.getProvider("git");

        expect(retrievedProvider).toBe(gitProvider);

    });


    it('should return undefined for an unregistered provider', () => {
        const retrievedProvider = registry.getProvider("unknown" as any); // Cast to any to test unknown provider
        expect(retrievedProvider).toBeUndefined();
    });




      it('should handle multiple providers', () => {
        const fileSystemProvider: IFileSystemProvider = {
          id: 'filesystem',
          load: jest.fn().mockResolvedValue([]),
        };
        const gitProvider: IGitProvider = {
          id: 'git',
          load: jest.fn().mockResolvedValue([]),
        };


        registry.registerProvider('filesystem', fileSystemProvider);
        registry.registerProvider('git', gitProvider);

        expect(registry.getProvider('filesystem')).toBe(fileSystemProvider);
        expect(registry.getProvider('git')).toBe(gitProvider);
      });





});

