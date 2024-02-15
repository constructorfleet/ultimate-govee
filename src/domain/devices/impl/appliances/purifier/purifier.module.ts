import { Module, OnModuleDestroy } from '@nestjs/common';
import { PurifierFactory } from './purifier';

@Module({
  providers: [PurifierFactory],
  exports: [PurifierFactory],
})
export class PurifierModule {}
