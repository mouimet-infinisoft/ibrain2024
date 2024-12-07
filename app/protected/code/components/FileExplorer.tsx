// FileExplorer.tsx
import React from "react";
import { Folder, FileText, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileSystemNode } from "../types";


interface FileExplorerProps {
  fileSystem: FileSystemNode[];
  openFiles: FileSystemNode[]; // Adjust type if needed
  selectedFileId: string | null;
  onFileSelect: (file: FileSystemNode) => void;
  onCreateFile: (parentId: string, filename: string) => void;
  onCreateFolder: (parentId: string, folderName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  fileSystem,
  openFiles,
  selectedFileId,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onDeleteFolder,
}) => {
  const renderFileTree = (nodes: FileSystemNode[], depth = 1) => {
    return (
      <div>
        {nodes.map((node) => (
          <div key={node.id}>
            <div
              className={cn(
                "flex items-center hover:bg-accent cursor-pointer rounded text-sm p-2",
                node.type === "file" ? `pl-${depth * 4}` : ``,
                selectedFileId === node.id ? "bg-accent" : ""
              )}
              onClick={() => node.type === "file" && onFileSelect(node)}
            >
              {node.type === "directory" ? (
                <div className="flex items-center">
                  <Folder size={16} className="mr-2" />
                  <span>{node.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <FileText size={16} className="mr-2" />
                  <span>{node.name}</span>
                </div>
              )}
              <X
                size={16}
                className="ml-2 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  if (node.type === "file") {
                    onDeleteFile(node.id);
                  } else {
                    onDeleteFolder(node.id);
                  }
                }}
              />
            </div>
            {node.type === "directory" &&
              node.children &&
              renderFileTree(node.children, depth + 1)}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="w-64 h-full border-r bg-background p-2">
      <h3 className="font-bold mb-2 text-sm">File Explorer</h3>
      <ScrollArea className="h-[calc(100%-80px)]"> {/* Adjusted height */}
        {renderFileTree(fileSystem)}
      </ScrollArea>
      <div className="flex justify-between items-center p-2 border-t">
        <button
          className="flex items-center text-primary hover:text-primary/80"
          onClick={() => {
            const filename = prompt("Enter filename (e.g., example.ts)");
            if (filename) {
              onCreateFile("root-src", filename); // Or appropriate parent ID
            }
          }}
        >
          <Plus size={16} className="mr-2" />
          New File
        </button>
        <button
          className="flex items-center text-primary hover:text-primary/80"
          onClick={() => {
            const folderName = prompt("Enter folder name (e.g., components)");
            if (folderName) {
              onCreateFolder("root-src", folderName); // Or appropriate parent ID
            }
          }}
        >
          <Plus size={16} className="mr-2" />
          New Folder
        </button>
      </div>
    </div>
  );
};

export default FileExplorer;