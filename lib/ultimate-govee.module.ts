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
import { DynamicModule, Module } from '@nestjs/common';
import { PersistModule } from '~ultimate-govee-persist';
import { BleChannelModule, IoTChannelModule } from '~ultimate-govee-domain';
import { RestChannelModule } from './domain/channels/rest/rest-channel.module';

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
        isAsyncModuleOptions(options.channels?.ble ?? {})
          ? BleChannelModule.forRootAsync(options.channels?.ble ?? {})
          : BleChannelModule.forRoot(
              options.channels?.ble ?? { enabled: false },
            ),
        isAsyncModuleOptions(options.channels?.iot ?? {})
          ? IoTChannelModule.forRootAsync(options.channels?.iot ?? {})
          : IoTChannelModule.forRoot(
              options.channels?.iot ?? { enabled: true },
            ),
        isAsyncModuleOptions(options.channels?.rest ?? {})
          ? RestChannelModule.forRootAsync(options.channels?.rest ?? {})
          : RestChannelModule.forRoot(options.channels?.rest ?? {}),
        DevicesModule,
      ],
      providers: [UltimateGoveeConfiguration, UltimateGoveeService],
      exports: [UltimateGoveeConfiguration, UltimateGoveeService],
    };
  }
}
