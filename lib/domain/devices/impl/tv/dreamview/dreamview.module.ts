import { Module } from '@nestjs/common';
import { DreamViewFactory } from './dreamview';

@Module({
  providers: [DreamViewFactory],
  exports: [DreamViewFactory],
})
export class DreamviewModule {}
