import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GoveeAPIModule } from '~ultimate-govee-data';
import {
  ConfigureRestChannelCommandHandler,
  ModelProductQueryHandler,
  RetrieveDeviceListCommandHandler,
  RetrieveLightEffectsCommandHandler,
} from './handlers';
import { RestChannelSagas } from './rest-channel.sagas';
import { RestChannelService } from './rest-channel.service';
import {
  RestChannelConfigAuthProvider,
  RestChannelConfigEnabledProvider,
} from './rest-channel.providers';
import { ConfigurableModuleClass } from './rest-channel.types';

@Module({
  imports: [CqrsModule, GoveeAPIModule],
  providers: [
    RestChannelConfigAuthProvider,
    RestChannelConfigEnabledProvider,
    ModelProductQueryHandler,
    ConfigureRestChannelCommandHandler,
    RetrieveDeviceListCommandHandler,
    RetrieveLightEffectsCommandHandler,
    RestChannelSagas,
    RestChannelService,
  ],
  exports: [
    ModelProductQueryHandler,
    ConfigureRestChannelCommandHandler,
    RetrieveLightEffectsCommandHandler,
    RetrieveDeviceListCommandHandler,
    RestChannelSagas,
    RestChannelService,
  ],
})
export class RestChannelModule extends ConfigurableModuleClass {}
