import { Module } from '@nestjs/common';
import { PurifierModuel as PurifierModule } from './purifier/purifier.module';
import { HumidifierModule } from './humidifier/humidifier.module';
import { AppliancesFactory } from './appliances.factory';

@Module({
  imports: [PurifierModule, HumidifierModule],
  providers: [AppliancesFactory],
  exports: [AppliancesFactory],
})
export class AppliancesModule {}
