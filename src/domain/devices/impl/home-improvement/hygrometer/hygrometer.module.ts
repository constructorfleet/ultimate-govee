import { Module } from '@nestjs/common';
import { HygrometerDevice, HygrometerFactory } from './hygrometer';

@Module({
  providers: [HygrometerFactory],
  exports: [HygrometerFactory],
})
export class HygrometerModule {}
