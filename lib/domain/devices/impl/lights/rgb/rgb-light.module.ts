import { Module } from '@nestjs/common';
import { RGBLightFactory } from './rgb-light';

@Module({
  providers: [RGBLightFactory],
  exports: [RGBLightFactory],
})
export class RGBLightModule {}
