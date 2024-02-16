import { DynamicModule, Module } from '@nestjs/common';
import { PersistService } from './persist.service';
import {
  FileReader,
  FileWriter,
  createPersistedFileProviders,
} from './persist.providers';

@Module({})
export class PersistModule {
  static forRoot(): DynamicModule {
    const providers = createPersistedFileProviders();
    return {
      global: true,
      module: PersistModule,
      providers: [...providers, PersistService, FileReader, FileWriter],
      exports: [PersistService, ...providers],
    };
  }
}
