import { Module, OnModuleDestroy } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataModule, GoveeAPIModule } from '@govee/data';
import {
  ConfigureRestChannelCommandHandler,
  ModelProductQueryHandler,
  RetrieveDeviceListCommandHandler,
  RetrieveLightEffectsCommandHandler,
} from './handlers';
import { RestChannelSagas } from './rest-channel.sagas';
import { RestChannelService } from './rest-channel.service';
import { ModuleDestroyObservable } from '@govee/common';

@Module({
  imports: [CqrsModule, GoveeAPIModule],
  providers: [
    ModuleDestroyObservable,
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
export class RestChannelModule implements OnModuleDestroy {
  constructor(private readonly moduleDestroyed$: ModuleDestroyObservable) {}

  onModuleDestroy() {
    this.moduleDestroyed$.next();
    this.moduleDestroyed$.complete();
  }
}
