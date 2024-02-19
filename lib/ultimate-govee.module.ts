import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistModule } from './persist';
import { UltimateGoveeService } from './ultimate-govee.service';
import { AuthModule } from './domain/auth';
import { ChannelsModule } from './domain/channels';
import { DevicesModule } from './domain/devices';
import { UltimateGoveeConfiguration } from './ultimate-govee.config';
import { ConfigurableModuleClass, OPTIONS_TYPE } from './ultimate-govee.types';
import { isAsyncModuleOptions } from '~ultimate-govee-common';

@Module({
  imports: [ConfigModule.forRoot(), CqrsModule.forRoot(), DevicesModule],
  providers: [UltimateGoveeConfiguration, UltimateGoveeService],
})
export class UltimateGoveeModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
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
        ChannelsModule.forRoot(options.channels ?? {}),
        DevicesModule,
      ],
      providers: [UltimateGoveeConfiguration, UltimateGoveeService],
    };
  }
}
