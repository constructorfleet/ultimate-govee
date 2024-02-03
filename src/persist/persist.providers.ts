import { FactoryProvider, Inject } from '@nestjs/common';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';

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
    provide: `Persisted.${ filePath }`,
    useFactory: async () => {
      if (!existsSync(filePath)) {
        return undefined;
      }
      const data = await readFile(filePath, { encoding: 'utf-8' });
      if (!options.transform) {
        return JSON.parse(data);
      }
      return options.transform(JSON.parse(data));
    },
  }));

export const InjectPersisted = (persistedFile: PersistedFile) => {
  if (persistedFiles[persistedFile.filename] === undefined) {
    persistedFiles[persistedFile.filename] = persistedFile;
  }
  return Inject(`Persisted.${ persistedFile.filename }`);
};
