import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UltimateGoveeService } from './ultimate-govee.service';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';
import { ConfigurableModuleClass } from './ultimate-govee.types';
import { Module } from '@nestjs/common';
import { DevicesModule } from '~ultimate-govee-domain';

@Module({
  imports: [ConfigModule.forRoot(), CqrsModule.forRoot(), DevicesModule],
  providers: [UltimateGoveeConfiguration, UltimateGoveeService],
})
export class UltimateGoveeModule extends ConfigurableModuleClass {}
