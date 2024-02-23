import { ConfigurableModuleBuilder, Module } from '@nestjs/common';
import { PersistService } from './persist.service';
import {
  FileReader,
  FileWriter,
  InjectRootDirectory,
  RootDirectoryProvider,
  createPersistedFileProviders,
} from './persist.providers';
import {
  PersistContext,
  PersistModuleOptions as ModuleOptions,
  PersistModuleOptionsKey,
} from './persist.types';

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<ModuleOptions>({
  moduleName: 'PersistModule',
  optionsInjectionToken: PersistModuleOptionsKey,
})
  .setExtras(
    {
      isGlobal: true,
    },
    (definition, extras) => {
      const providers = createPersistedFileProviders();
      return {
        ...definition,
        global: extras.isGlobal,
        providers: [...(definition.providers ?? []), ...providers],
        exports: [...(definition.exports ?? []), ...providers],
      };
    },
  )
  .setClassMethodName('forRoot')
  .build();

export const PersistModuleOptions = typeof OPTIONS_TYPE;
export const AsyncPersistModuleOptions = typeof ASYNC_OPTIONS_TYPE;

@Module({
  providers: [PersistService, FileReader, FileWriter, RootDirectoryProvider],
  exports: [PersistService],
})
export class PersistModule extends ConfigurableModuleClass {
  constructor(
    @InjectRootDirectory
    rootDirectory?: string,
  ) {
    super();
    PersistContext.rootDirectory = rootDirectory ?? '.';
  }
}
