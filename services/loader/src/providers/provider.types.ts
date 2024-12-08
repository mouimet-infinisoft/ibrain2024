import { FileSystemProviderLoadInput, FileSystemProviderLoadOutput } from "./filesystem/file.system.provider.types";
import { GitProviderLoadInput, GitProviderLoadOutput } from "./git/git.provider.types"; 

export interface IFileSystemProvider {
    id: "filesystem";
    load(input: FileSystemProviderLoadInput): FileSystemProviderLoadOutput;
}

export interface IGitProvider {
    id: "git";
    load(input: GitProviderLoadInput): GitProviderLoadOutput;
}


export type TDataLoaderProvider = IFileSystemProvider | IGitProvider;
export type TProviderId = TDataLoaderProvider['id'];

