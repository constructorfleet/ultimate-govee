import { Module } from '@nestjs/common';
import { PurifierModuel as PurifierModule } from './purifier/purifier.module';
import { HumidifierModule } from './humidifier/humidifier.module';

@Module({
  imports: [PurifierModule, HumidifierModule],
})
export class AppliancesModule {}
