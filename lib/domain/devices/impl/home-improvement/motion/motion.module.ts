import { Module } from '@nestjs/common';
import { MotionFactory } from './motion';

@Module({
  providers: [MotionFactory],
  exports: [MotionFactory],
})
export class MotionModule {}
