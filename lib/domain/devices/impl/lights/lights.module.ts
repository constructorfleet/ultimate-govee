import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RGBLightModule } from './rgb/rgb-light.module';
import { RGBICLightModule } from './rgbic/rgbic-light.module';
import { LightsFactory } from './lights.factory';
import { LightsSagas } from './lights.sagas';

@Module({
  imports: [CqrsModule, RGBLightModule, RGBICLightModule],
  providers: [LightsFactory, LightsSagas],
  exports: [LightsFactory, LightsSagas],
})
export class LightsModule {}
