"use client";
import { FileLanguage } from "./types";

// Utility to determine file language based on extension
export const getLanguageFromExtension = (filename: string): FileLanguage => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
        case "ts":
            return "typescript";
        case "tsx":
            return "typescript";
        case "js":
            return "javascript";
        case "jsx":
            return "javascript";
        case "md":
            return "markdown";
        case "py":
            return "python";
        case "json":
            return "json";
        default:
            return "typescript"; // Default fallback
    }
};
