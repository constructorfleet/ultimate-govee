import { Module } from '@nestjs/common';
import { RGBICLightFactory } from './rgbic-light';

@Module({
  providers: [RGBICLightFactory],
  exports: [RGBICLightFactory],
})
export class RGBICLightModule {}
