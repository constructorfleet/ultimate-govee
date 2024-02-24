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
import { ChannelModule } from '~ultimate-govee-domain/channels/channel.module';

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
        isAsyncModuleOptions(options.channels ?? {})
          ? ChannelModule.forRootAsync(options.channels ?? {})
          : ChannelModule.forRoot(options.channels ?? {}),
        DevicesModule,
      ],
      providers: [UltimateGoveeConfiguration, UltimateGoveeService],
    };
  }
}
