import { editor } from "monaco-editor";
import { useState, useRef, useCallback } from "react";
import { FileSystemNode, OpenFile } from "../types";
import { getLanguageFromExtension } from "../utils/getLanguageFromExtension";

export const useFileOperations = (initialFileSystem: FileSystemNode[]) => {
    const [fileSystem, setFileSystem] = useState<FileSystemNode[]>(initialFileSystem);
    const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
    const editorsRef = useRef<{ [key: string]: editor.IStandaloneCodeEditor }>(
      {}
    );

    const handleFileSelect = useCallback((file: FileSystemNode) => {
      const existingOpenFile = openFiles.find((f) => f.id === file.id);
      if (!existingOpenFile) {
        setOpenFiles((prev) => [...prev, { ...file, hasUnsavedChanges: false }]);
      }
      setSelectedFileId(file.id);
    }, [openFiles]);

    const updateFileSystem = useCallback((updater: (nodes: FileSystemNode[]) => FileSystemNode[]) => {
      setFileSystem((prev) => updater(prev));
    }, []);

    const handleSaveFile = useCallback((fileId: string) => {
      const editorToSave = editorsRef.current[fileId];
      if (!editorToSave) return;

      const updateNodes = (nodes: FileSystemNode[]): FileSystemNode[] => nodes.map(node => {
        if (node.id === fileId) {
          return { ...node, content: editorToSave.getValue() };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) }; // Recursive call
        }
        return node;
      });

      updateFileSystem(updateNodes);

      setOpenFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, hasUnsavedChanges: false } : file
        )
      );
    }, [editorsRef, updateFileSystem]);

    const handleCloseFile = useCallback((fileId: string) => {
      setOpenFiles((prev) => prev.filter((file) => file.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
      delete editorsRef.current[fileId];
    }, [selectedFileId, editorsRef]);

    const handleEditorChange = useCallback((fileId: string) => {
      setOpenFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, hasUnsavedChanges: true } : file
        )
      );
    }, []);

    const handleCreateFile = useCallback((parentId: string, filename: string) => {
      const newFileId = `${parentId}-${filename}`;
      const newFile: FileSystemNode = {
        id: newFileId,
        name: filename,
        type: "file",
        content: "",
        language: getLanguageFromExtension(filename),
      };

      const updateNodes = (nodes: FileSystemNode[]): FileSystemNode[] => nodes.map(node => {
        if (node.id === parentId) {
          return { ...node, children: node.children ? [...node.children, newFile] : [newFile] };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) }; // Recursive call
        }
        return node;
      });

      updateFileSystem(updateNodes);
    }, [updateFileSystem]);

    const handleCreateFolder = useCallback((parentId: string, folderName: string) => {
      const newFolderId = `${parentId}-${folderName}`;
      const newFolder: FileSystemNode = {
        id: newFolderId,
        name: folderName,
        type: "directory",
        children: [],
      };

      const updateNodes = (nodes: FileSystemNode[]): FileSystemNode[] => nodes.map(node => {
        if (node.id === parentId) {
          return { ...node, children: node.children ? [...node.children, newFolder] : [newFolder] };
        }
        if (node.children) {
          return { ...node, children: updateNodes(node.children) }; // Recursive call
        }
        return node;
      });
      updateFileSystem(updateNodes);

    }, [updateFileSystem]);


    const handleDeleteItem = useCallback((itemId: string) => {
      const updateNodes = (nodes: FileSystemNode[]): FileSystemNode[] => nodes.flatMap((node) => {
        if (node.id === itemId) {
          return []; // Remove the node/folder
        }
        if (node.children) {
          const updatedChildren = updateNodes(node.children); // recursive call
          if (updatedChildren.length > 0 || node.type === "file") {
            return [{ ...node, children: updatedChildren }];
          } else {
            return []; // remove empty folders
          }

        }
        return [node];
      });
      updateFileSystem(updateNodes);

      setOpenFiles((prevOpenFiles) =>
         prevOpenFiles.filter((file) => !file.id.startsWith(itemId))
      );

      if (selectedFileId && selectedFileId.startsWith(itemId)) {
         setSelectedFileId(null);
      }
      if (editorsRef.current[itemId]) {
        delete editorsRef.current[itemId];
      }
    }, [selectedFileId, updateFileSystem, editorsRef]);


    return {
      fileSystem,
      openFiles,
      selectedFileId,
      setSelectedFileId,
      editorsRef,
      handleFileSelect,
      handleSaveFile,
      handleCloseFile,
      handleEditorChange,
      handleCreateFile,
      handleCreateFolder,
      handleDeleteFile: handleDeleteItem,
      handleDeleteFolder: handleDeleteItem,

    };
  };

