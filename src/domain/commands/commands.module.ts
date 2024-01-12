import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class CommandsModule {
  static forRoot(): DynamicModule {
    return {
      module: CommandsModule,
      providers: [],
      exports: [],
    };
  }
}
