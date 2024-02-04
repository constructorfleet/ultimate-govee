import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataModule } from '@govee/data';
import {
  ConfigureRestChannelCommandHandler,
  ModelProductQueryHandler,
  RetrieveDeviceListCommandHandler,
  RetrieveLightEffectsCommandHandler,
} from './handlers';
import { RestChannelSagas } from './rest-channel.sagas';
import { RestChannelService } from './rest-channel.service';

@Module({
  imports: [CqrsModule, DataModule],
  providers: [
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
export class RestChannelModule {}
