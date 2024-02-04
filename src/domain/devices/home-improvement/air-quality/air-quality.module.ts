import { Module } from '@nestjs/common';
import { SensorFactory } from './air-quality';

@Module({
  providers: [SensorFactory],
  exports: [SensorFactory],
})
export class AirQualityModule {}
