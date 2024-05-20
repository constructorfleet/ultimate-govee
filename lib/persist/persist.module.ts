import { Module } from '@nestjs/common';
import { PersistService } from './persist.service';

import { existsSync } from 'fs';
import { readFile, stat } from 'fs/promises';
import MomentLib from 'moment';
import { join } from 'path';
import {
  ConfigurableModuleClass,
  FileReader,
  FileWriter,
  InjectRootDirectory,
  MODULE_OPTIONS_TOKEN,
  RootDirectoryProvider,
} from './persist.providers';
import { PersistedFile, PersistedFileData } from './persist.types';

@Module({
  providers: [PersistService, FileReader, FileWriter, RootDirectoryProvider],
  exports: [PersistService, MODULE_OPTIONS_TOKEN],
})
export class PersistModule extends ConfigurableModuleClass {
  private static rootDirectory: string = '.';
  static getPersistedFile = async <T>(
    options: PersistedFile,
  ): Promise<PersistedFileData<T>> => {
    const fullFilePath = join(
      PersistModule.rootDirectory ?? '.',
      options.filename,
    );
    try {
      if (!existsSync(fullFilePath)) {
        return {};
      }
      const stats = await stat(fullFilePath);
      const data = await readFile(fullFilePath, { encoding: 'utf-8' });
      if (!options.transform) {
        return {
          lastUpdate: MomentLib(stats.birthtime),
          data: JSON.parse(data) as T,
        };
      }
      return {
        lastUpdate: MomentLib(stats.birthtime),
        data: options.transform(JSON.parse(data)),
      };
    } catch (err) {
      return {};
    }
  };
  static get persistRootDirectory(): string {
    return this.rootDirectory;
  }

  constructor(
    @InjectRootDirectory
    rootDirectory?: string,
  ) {
    super();
    PersistModule.rootDirectory = rootDirectory ?? '.';
  }
}
