import { Module } from '@nestjs/common';
import { PurifierFactory } from './purifier';

@Module({
  providers: [PurifierFactory],
  exports: [PurifierFactory],
})
export class PurifierModuel {}
