import { Module } from '@nestjs/common';
import { PersistService } from './persist.service';

import {
  ConfigurableModuleClass,
  FileReader,
  FileWriter,
  InjectRootDirectory,
  MODULE_OPTIONS_TOKEN,
  RootDirectoryProvider,
} from './persist.providers';

@Module({
  providers: [PersistService, FileReader, FileWriter, RootDirectoryProvider],
  exports: [PersistService, MODULE_OPTIONS_TOKEN],
})
export class PersistModule extends ConfigurableModuleClass {
  private static rootDirectory: string = '.';
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
