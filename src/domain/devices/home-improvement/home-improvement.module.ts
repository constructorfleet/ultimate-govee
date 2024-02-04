import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AirQualityModule } from './air-quality/air-quality.module';
import { HomeImprovementFactory } from './home-improvement.factory';

@Module({
  imports: [CqrsModule, AirQualityModule],
  providers: [HomeImprovementFactory],
  exports: [HomeImprovementFactory],
})
export class HomeImprovementModule {}
