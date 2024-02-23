import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { UltimateGoveeService } from './ultimate-govee.service';
import { AuthModule } from './domain/auth';
import { DevicesModule } from './domain/devices';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';
import {
  ConfigurableModuleClass,
  UltimateGoveeModuleOptions,
} from './ultimate-govee.types';
import { isAsyncModuleOptions } from '~ultimate-govee-common';
import { IoTChannelModule } from '~ultimate-govee-domain';
import { DynamicModule, Module } from '@nestjs/common';
import { PersistModule } from '~ultimate-govee-persist';

@Module({
  imports: [ConfigModule.forRoot(), CqrsModule.forRoot(), DevicesModule],
  providers: [UltimateGoveeConfiguration, UltimateGoveeService],
})
export class UltimateGoveeModule extends ConfigurableModuleClass {
  static forRoot(options: UltimateGoveeModuleOptions): DynamicModule {
    return {
      module: UltimateGoveeModule,
      imports: [
        !isAsyncModuleOptions(options.auth ?? {})
          ? AuthModule.forRoot(options.auth ?? {})
          : AuthModule.forRootAsync(options.auth ?? {}),
        !isAsyncModuleOptions(options.persist ?? {})
          ? PersistModule.forRoot({
              rootDirectory: '.',
              ...(options.persist ?? {}),
            })
          : PersistModule.forRootAsync(options.persist ?? {}),
        !isAsyncModuleOptions(options.channels?.iot ?? {})
          ? IoTChannelModule.forRoot(options?.channels?.iot ?? {})
          : IoTChannelModule.forRootAsync(options?.channels?.iot ?? {}),
        !isAsyncModuleOptions(options.channels?.ble ?? {})
          ? IoTChannelModule.forRoot(options?.channels?.ble ?? {})
          : IoTChannelModule.forRootAsync(options?.channels?.ble ?? {}),
        DevicesModule,
      ],
      providers: [UltimateGoveeConfiguration, UltimateGoveeService],
    };
  }
}
