import { Service } from "@brainstack/inject";
import { IFileSystemProvider, IGitProvider, TDataLoaderProvider, TProviderId } from "../providers/provider.types";

@Service
export class DataLoaderRegistry {
    private providers = new Map(); // Good practice to add the type here

    registerProvider<T extends TProviderId>(providerId: T, provider: typeof providerId extends 'filesystem' ? IFileSystemProvider : IGitProvider): void {
        this.providers.set(providerId, provider);
    }

    getProvider<T extends TProviderId>(providerId: T) {
        const provider = this.providers.get(providerId);

        if (provider) {
            return provider as typeof provider.id extends 'filesystem' ? IFileSystemProvider : IGitProvider;
        }

        return undefined;
    }
}
