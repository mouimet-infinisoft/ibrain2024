// Types for file system and editor state
type FileType = "file" | "directory";
export type FileLanguage = "typescript" |
    "javascript" |
    "markdown" |
    "python" |
    "json";

export interface FileSystemNode {
    id: string;
    name: string;
    type: FileType;
    content?: string;
    language?: FileLanguage;
    children?: FileSystemNode[];
}
export interface OpenFile extends FileSystemNode {
    // Track unsaved changes
    hasUnsavedChanges?: boolean;
}
