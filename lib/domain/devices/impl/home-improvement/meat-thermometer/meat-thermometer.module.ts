import { Module } from '@nestjs/common';
import { MeatThermometerFactory } from './meat-thermometer';

@Module({
  providers: [MeatThermometerFactory],
  exports: [MeatThermometerFactory],
})
export class MeatThermometerModule {}
