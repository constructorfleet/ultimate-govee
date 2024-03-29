import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UltimateGoveeService } from './ultimate-govee.service';
import { AuthModule, OPTIONS_TYPE as AuthModuleOptions } from './domain/auth';
import { DevicesModule } from './domain/devices';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './ultimate-govee.types';
import { Module } from '@nestjs/common';
import {
  PersistModule,
  OPTIONS_TYPE as PersistModuleOptions,
} from '~ultimate-govee-persist';
import {
  BleChannelModule,
  BleChannelModuleOptions,
  IoTChannelModule,
  IoTChannelModuleOptions,
  RestChannelModule,
  RestChannelModuleOptions,
} from '~ultimate-govee-domain';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule.forRoot(),
    DevicesModule,
    PersistModule.forRootAsync({
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: typeof OPTIONS_TYPE): typeof PersistModuleOptions =>
        options?.persist ?? {},
    }),
    AuthModule.forRootAsync({
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: typeof OPTIONS_TYPE): typeof AuthModuleOptions =>
        options?.auth ?? {},
    }),
    RestChannelModule.forRootAsync({
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (
        options: typeof OPTIONS_TYPE,
      ): typeof RestChannelModuleOptions => options?.channels?.rest ?? {},
    }),
    BleChannelModule.forRootAsync({
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (
        options: typeof OPTIONS_TYPE,
      ): typeof BleChannelModuleOptions => options?.channels?.ble ?? {},
    }),
    IoTChannelModule.forRootAsync({
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (
        options: typeof OPTIONS_TYPE,
      ): typeof IoTChannelModuleOptions => options?.channels?.iot ?? {},
    }),
  ],
  providers: [UltimateGoveeConfiguration, UltimateGoveeService],
  exports: [
    UltimateGoveeConfiguration,
    UltimateGoveeService,
    MODULE_OPTIONS_TOKEN,
  ],
})
export class UltimateGoveeModule extends ConfigurableModuleClass {}
