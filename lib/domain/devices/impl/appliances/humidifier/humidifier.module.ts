import { Module, OnModuleDestroy } from '@nestjs/common';
import { HumidifierFactory } from './humidifier';

@Module({
  providers: [HumidifierFactory],
  exports: [HumidifierFactory],
})
export class HumidifierModule {}
