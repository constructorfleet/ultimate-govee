import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PurifierModule } from './purifier/purifier.module';
import { HumidifierModule } from './humidifier/humidifier.module';
import { AppliancesFactory } from './appliances.factory';

@Module({
  imports: [CqrsModule, PurifierModule, HumidifierModule],
  providers: [AppliancesFactory],
  exports: [AppliancesFactory],
})
export class AppliancesModule {}
