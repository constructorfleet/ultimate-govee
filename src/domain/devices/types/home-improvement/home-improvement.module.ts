import { Module } from '@nestjs/common';
import { AirQualityModule } from './air-quality/air-quality.module';
import { HomeImprovementFactory } from './home-improvement.factory';

@Module({
  imports: [AirQualityModule],
  providers: [HomeImprovementFactory],
  exports: [HomeImprovementFactory],
})
export class HomeImprovementModule {}
