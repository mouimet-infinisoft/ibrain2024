"use client";
import { FileSystemNode } from "../types";

// Initial file system mock data (same as before)
export const initialFileSystem: FileSystemNode[] = [
    {
        id: "root-src",
        name: "src",
        type: "directory",
        children: [
            {
                id: "index-ts",
                name: "index.ts",
                type: "file",
                content: '// Main application entry point\nconsole.log("Hello, World!");',
                language: "typescript",
            },
            {
                id: "components-dir",
                name: "components",
                type: "directory",
                children: [
                    {
                        id: "button-tsx",
                        name: "Button.tsx",
                        type: "file",
                        content: `
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  );
}
            `,
                        language: "typescript",
                    },
                ],
            },
        ],
    },
    {
        id: "readme",
        name: "README.md",
        type: "file",
        content: "# Project Documentation\n\nWelcome to the project!",
        language: "markdown",
    },
];
