import { Module } from '@nestjs/common';
import { IceMakerFactory } from './ice-maker';

@Module({
  providers: [IceMakerFactory],
  exports: [IceMakerFactory],
})
export class IceMakerModule {}
