// components/FileTabs.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { FileSystemNode, OpenFile } from "../types";

interface FileTabsProps {
  openFiles: OpenFile[];
  selectedFileId: string | null;
  onFileSelect: (fileId: FileSystemNode) => void;
  onFileClose: (fileId: string) => void;
}

const FileTabs: React.FC<FileTabsProps> = ({
  openFiles,
  selectedFileId,
  onFileSelect,
  onFileClose,
}) => {
  if (openFiles.length === 0) return null; // Don't render if no files are open

  return (
    <div className="flex border-b">
      {openFiles.map((file) => (
        <div
          key={file.id}
          className={cn(
            "flex items-center px-4 py-2 border-r cursor-pointer",
            selectedFileId === file.id ? "bg-accent" : "hover:bg-accent/50"
          )}
          onClick={() => onFileSelect(file)}
        >
          <span className="mr-2">{file.name}</span>
          {file.hasUnsavedChanges && <span className="text-red-500 text-xs">*</span>}
          <X
            size={16}
            className="ml-2 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onFileClose(file.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FileTabs;
