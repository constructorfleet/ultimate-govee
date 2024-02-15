import { Module } from '@nestjs/common';
import { RGBICLightFactory } from '..';

@Module({
  providers: [RGBICLightFactory],
  exports: [RGBICLightFactory],
})
export class RGBICLightModule {}
