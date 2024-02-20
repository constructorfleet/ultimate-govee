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
  PersistModuleOptions,
  PersistModuleOptionsKey,
} from './persist.types';

export const {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<PersistModuleOptions>({
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

export const PersistModuleOptionsType = OPTIONS_TYPE;
export const AsyncPersistModuleOptionsType = ASYNC_OPTIONS_TYPE;

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
