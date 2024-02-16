import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AirQualityModule } from './air-quality/air-quality.module';
import { HomeImprovementFactory } from './home-improvement.factory';
import { HygrometerModule } from './hygrometer/hygrometer.module';

@Module({
  imports: [CqrsModule, AirQualityModule, HygrometerModule],
  providers: [HomeImprovementFactory],
  exports: [HomeImprovementFactory],
})
export class HomeImprovementModule {}
