import { Inject, Service, getInstance } from "@brainstack/inject";
import { DataLoaderRegistry } from "./registry/data.loader.registry";
import { LoggerService } from "../../logger/logger.service";
import {  TProviderId } from "./providers/provider.types"; // Import TDataLoaderProvider
import { FileSystemProviderLoadInput, FileSystemProviderLoadOutput } from "./providers/filesystem/file.system.provider.types";
import { GitProviderLoadInput, } from "./providers/git/git.provider.types";


@Service
export class DataLoaderService {
    constructor(@Inject private registry: DataLoaderRegistry, @Inject private logger: LoggerService) { }
    load<T extends TProviderId>(
        providerId: T,
        input: T extends "filesystem" ? FileSystemProviderLoadInput : GitProviderLoadInput
    ) {
        this.logger.info(`Load provider id: `, providerId, ` with input arguments: `, input);

        const provider = this.registry.getProvider(providerId);

        if (!provider) {
            this.logger.error(`No provider registered id: ${providerId}`);
            throw new Error(`No provider registered with id: ${providerId}`);
        }

        if (provider.id === 'filesystem') {
            return provider.load(input as FileSystemProviderLoadInput); 
        } else if (provider.id === 'git') {  
            return provider.load(input as GitProviderLoadInput);      
        }

        throw new Error(`Unexpected provider id: ${providerId}`);

    }
}

