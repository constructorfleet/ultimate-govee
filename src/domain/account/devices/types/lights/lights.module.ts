import { Module } from '@nestjs/common';
import { RGBLightModule } from './rgb/rgb-light.module';
import { RGBICLightModule } from './rgbic/rgbic-light.module';
import { LightsFactory } from './lights.factory';

@Module({
  imports: [RGBLightModule, RGBICLightModule],
  providers: [LightsFactory],
  exports: [LightsFactory],
})
export class LightsModule {}
