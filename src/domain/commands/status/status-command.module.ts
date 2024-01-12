import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class StatusCommandModule {
  static forRoot(): DynamicModule {
    return {
      module: StatusCommandModule,
      providers: [],
      exports: [],
    };
  }
}
