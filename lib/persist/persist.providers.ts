import { FactoryProvider, Inject } from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { PersistModuleOptions, PersistModuleOptionsKey } from './persist.types';
import { join } from 'path';

export const RootDirectoryKey = 'Persist.Root.Directory';
export const InjectRootDirectory = Inject(RootDirectoryKey);
export const RootDirectoryProvider: FactoryProvider = {
  provide: RootDirectoryKey,
  inject: [PersistModuleOptionsKey],
  useFactory: (options: PersistModuleOptions): string =>
    options.rootDirectory ?? './',
};

export type FileReader = typeof readFile;

export const FileReader: FactoryProvider = {
  provide: 'Persist.File.Reader',
  useFactory: () => readFile,
};

export type FileWriter = typeof writeFile;

export const FileWriter: FactoryProvider = {
  provide: 'Persist.File.Writer',
  useFactory: () => writeFile,
};

export type PersistedFile = {
  filename: string;
  transform?: (data: any) => any;
};

const persistedFiles: Record<string, PersistedFile> = {};

export const createPersistedFileProviders = () =>
  Object.entries(persistedFiles).map(([filePath, options]) => ({
    provide: `Persisted.${filePath}`,
    inject: [RootDirectoryKey],
    useFactory: async (rootDirectory: string) => {
      const fullFilePath = join(rootDirectory ?? '.', filePath);
      try {
        if (!existsSync(fullFilePath)) {
          return undefined;
        }
        const data = await readFile(fullFilePath, { encoding: 'utf-8' });
        if (!options.transform) {
          return JSON.parse(data);
        }
        return options.transform(JSON.parse(data));
      } catch (err) {
        return;
      }
    },
  }));

export const InjectPersisted = (persistedFile: PersistedFile) => {
  if (persistedFiles[persistedFile.filename] === undefined) {
    persistedFiles[persistedFile.filename] = persistedFile;
  }
  return Inject(`Persisted.${persistedFile.filename}`);
};
