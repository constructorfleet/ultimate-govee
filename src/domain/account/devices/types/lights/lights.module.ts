import { Module } from '@nestjs/common';
import { RGBLightFactory } from './rgb/rgb-light';
import { LightsFactory } from './lights.factory';
import { RGBICLightFactory } from './rgbic/rgbic-light';

@Module({
  imports: [RGBLightFactory, RGBICLightFactory],
  exports: [LightsFactory],
})
export class LightsModule {}
