import { getInstance } from "@brainstack/inject";
import { DataLoaderService } from "../data.loader.service";
import { DataLoaderRegistry } from "../registry/data.loader.registry";
import { LoggerService } from "../../../logger/logger.service";
import { FileSystemProvider } from "../providers/filesystem/file.system.provider";
import { writeFileSync } from "fs";

let service: DataLoaderService;
let registry: DataLoaderRegistry;
let logger: LoggerService;

registry = new DataLoaderRegistry();
logger = new LoggerService();
// logger.seLogLevel(LogLevel.VERBOSE)
registry.registerProvider("filesystem", getInstance(FileSystemProvider));
service = new DataLoaderService(registry, logger);
const codebase = service.load("filesystem", {
    sources: [
        {
            mode: "path",
            basePath: "/home/nitr0gen/ibrain2024/ibrain2024/services",
            recursive: true,
            matchPattern: ".ts,package.json",
            excludePattern: "node_modules,package-lock",
            includeContent: true,
        },
        // {
        //     mode: "path",
        //     basePath: "/home/nitr0gen/ibrain2024/ibrain2024/services/task-manager",
        //     recursive: true,
        //     matchPattern: ".ts,package.json",
        //     excludePattern: "node_modules,package-lock",
        //     includeContent: true,
        // },
        // {
        //     mode: "path",
        //     basePath: "/home/nitr0gen/ibrain2024/ibrain2024/services/intent-engine",
        //     recursive: true,
        //     matchPattern: ".ts,package.json",
        //     excludePattern: "node_modules,package-lock",
        //     includeContent: true,
        // },
        // {
        //     mode: "path",
        //     basePath: "/home/nitr0gen/ibrain2024/ibrain2024/services/db",
        //     recursive: true,
        //     matchPattern: ".ts,package.json",
        //     excludePattern: "node_modules,package-lock",
        //     includeContent: true,
        // },
        // {
        //     mode: "path",
        //     basePath: "/home/nitr0gen/ibrain2024/ibrain2024/services/ai",
        //     recursive: true,
        //     matchPattern: ".ts,package.json",
        //     excludePattern: "node_modules,package-lock",
        //     includeContent: true,
        // },
    ],
});

writeFileSync("./all.codebase.json", JSON.stringify(codebase));    
