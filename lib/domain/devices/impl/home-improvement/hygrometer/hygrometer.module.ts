import { Module } from '@nestjs/common';
import { HygrometerFactory } from './hygrometer';

@Module({
  providers: [HygrometerFactory],
  exports: [HygrometerFactory],
})
export class HygrometerModule {}
