import { DynamicModule, Module, NotImplementedException } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IoTChannelModule } from './iot';
import { RestChannelModule } from './rest';
import { BleChannelModule } from './ble/ble-channel.module';
import { TogglableChannelsProvider } from './channel.providers';
import {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  OPTIONS_TYPE,
} from './channel.types';
import { isAsyncModuleOptions } from '~ultimate-govee-common';

@Module({})
export class ChannelsModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    return {
      module: ChannelsModule,
      imports: [
        CqrsModule,
        RestChannelModule.forRoot(options.rest ?? {}),
        !isAsyncModuleOptions(options.ble ?? {})
          ? BleChannelModule.forRoot(options.ble ?? {})
          : BleChannelModule.forRootAsync(options.ble ?? {}),
        !isAsyncModuleOptions(options.iot ?? {})
          ? IoTChannelModule.forRoot(options.iot ?? {})
          : IoTChannelModule.forRootAsync(options.iot ?? {}),
      ],
      providers: [TogglableChannelsProvider],
      exports: [
        TogglableChannelsProvider,
        BleChannelModule,
        IoTChannelModule,
        RestChannelModule,
      ],
    };
  }

  /* trunk-ignore(eslint/@typescript-eslint/no-unused-vars) */
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    throw new NotImplementedException();
  }
}
