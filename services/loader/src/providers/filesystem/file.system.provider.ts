import { Inject, Service } from '@brainstack/inject';
import { LoggerService } from '../../../../logger/logger.service';
import { Dirent, readdirSync, readFileSync } from 'fs';
import { join, extname } from 'path'
import { FileSystemProviderItem, FileSystemProviderLoadInput, FileSystemProviderLoadInputSource, IFileSystemProvider } from './file.system.provider.types';


@Service
export class FileSystemProvider implements IFileSystemProvider {
    readonly id = "filesystem";

    constructor(@Inject private logger: LoggerService) { }

    load(inputArgs: FileSystemProviderLoadInput) {
        this.logger.info('Load method called with inputArgs:', inputArgs);
        const result: Array<FileSystemProviderItem> = [];


        try {

            inputArgs.sources.forEach(source => {
                this.logger.info('Processing source:', source);
                if (source.mode === 'list') {
                    result.push(...this.handleListMode(source));
                } else if (source.mode === 'path') {
                    result.push(...this.handlePathMode(source));
                }
            });

        } catch (error) {
            this.logger.error(`Error in FileSystemProvider.load:`, error);
            throw error;
        }

        this.logger.verbose(`Load Result: `, result);

        return result;
    }

    private handleListMode(source: FileSystemProviderLoadInputSource): Array<FileSystemProviderItem> {
        const result: Array<FileSystemProviderItem> = [];
        if (source.mode === 'list' && Array.isArray(source.files)) {
            this.logger.info('Source mode is list. Files:', source.files);
            source.files.forEach(file => {
                const content = readFileSync(file, { encoding: 'utf-8' });
                this.logger.info('Read file:', file);
                result.push({ path: file, type: extname(file), content });
            });
        } else {
            this.logger.warn('Invalid source for list mode:', source);
        }
        return result;
    }

    private handlePathMode(source: FileSystemProviderLoadInputSource) {
        const result: Array<FileSystemProviderItem> = [];

        if (source.mode === 'path') {
            this.logger.info('Source mode is path. Base path: ', source.basePath);
            const allFilesFolders = readdirSync(source.basePath, { recursive: source.recursive, withFileTypes: true });
            this.logger.verbose(`allFilesFolders: `, allFilesFolders);
            const filteredFiles = this.filterData(allFilesFolders, source);
            this.logger.verbose(`Filtered files: `, filteredFiles);

            filteredFiles.forEach(file => {
                try {
                    this.logger.verbose('file: ', file);

                    if (!file.path || !file.name || !file.isFile()) {
                        return
                    }

                    if (source.includeContent) {
                        const filePath = join(file.path, file.name);
                        const content = readFileSync(filePath, { encoding: 'utf-8' });
                        this.logger.info('Read file from path:', filePath);
                        result.push({ path: filePath, type: extname(file.name), content });
                    } else {
                        const filePath = join(file.path, file.name);
                        this.logger.info('Add file without content. :', filePath);
                        result.push({ path: filePath, type: extname(file.name) });
                    }
                } catch (error) {
                    this.logger.error(`Error in FileSystemProvider.load.handlePathMode filteredFiles.forEach(file.. file = `, file, ` Error was:`, error);
                    throw error;
                }

            });

        }

        return result

    }

    private filterData(data: Dirent[], options: FileSystemProviderLoadInputSource): Dirent[] {
        if (options.mode !== 'path') {
            this.logger.error(`filterData: Invalid options: `, options);
            throw Error(`filterData: Invalid options: ${JSON.stringify(options)}`);
        }

        return data.filter(item => {
            const matches = options.matchPattern
                ? options.matchPattern.split(',').some(pattern => item.name.includes(pattern.trim()))
                : true;
            const excludes = options.excludePattern
                ? options.excludePattern.split(',').some(pattern => item.name.includes(pattern.trim()) ||  item.path.includes(pattern.trim()))
                : false;
            return matches && !excludes;
        });
    }

}
