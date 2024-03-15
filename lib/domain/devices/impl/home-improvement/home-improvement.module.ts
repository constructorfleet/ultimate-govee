import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AirQualityModule } from './air-quality/air-quality.module';
import { HomeImprovementFactory } from './home-improvement.factory';
import { HygrometerModule } from './hygrometer/hygrometer.module';
import { PresenceModule } from './presence/presence.module';
import { MotionModule } from './motion/motion.module';

@Module({
  imports: [
    CqrsModule,
    AirQualityModule,
    HygrometerModule,
    PresenceModule,
    MotionModule,
  ],
  providers: [HomeImprovementFactory],
  exports: [HomeImprovementFactory],
})
export class HomeImprovementModule {}
