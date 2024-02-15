import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PurifierModule } from './purifier/purifier.module';
import { HumidifierModule } from './humidifier/humidifier.module';
import { IceMakerModule } from './ice-maker/ice-maker.module';
import { AppliancesFactory } from './appliances.factory';

@Module({
  imports: [CqrsModule, PurifierModule, HumidifierModule, IceMakerModule],
  providers: [AppliancesFactory],
  exports: [AppliancesFactory],
})
export class AppliancesModule {}
