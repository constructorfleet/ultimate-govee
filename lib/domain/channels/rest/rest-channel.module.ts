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
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './rest-channel.types';

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
    MODULE_OPTIONS_TOKEN,
  ],
})
export class RestChannelModule extends ConfigurableModuleClass {}
