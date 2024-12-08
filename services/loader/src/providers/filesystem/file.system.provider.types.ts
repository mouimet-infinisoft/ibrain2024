
export interface IFileSystemProvider {
    id: "filesystem"; 
    load(input: FileSystemProviderLoadInput): FileSystemProviderLoadOutput
}

export type FileSystemProviderLoadInputSource = (
    { mode: "path"; } & {
        basePath: string;
        recursive: boolean;
        matchPattern?: string;
        excludePattern?: string;
        includeContent: boolean;
    }) | ({ mode: "list"; } & {
        files: Array<string>;
        includeContent: boolean;
    });

export type FileSystemProviderLoadInput = {
    sources: Array<FileSystemProviderLoadInputSource>;
};

export type FileSystemProviderItem = {
    path: string;
    type: string;
    content?: string;
};


export type FileSystemProviderLoadOutput = Array<FileSystemProviderItem>;


