import { Module } from '@nestjs/common';
import { AirQualityFactory } from './air-quality';

@Module({
  providers: [AirQualityFactory],
  exports: [AirQualityFactory],
})
export class AirQualityModule {}
