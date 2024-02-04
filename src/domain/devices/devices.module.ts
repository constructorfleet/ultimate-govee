import { Module } from '@nestjs/common';
import { DataModule } from '@govee/data';
import { AppliancesModule } from './appliances/appliances.module';
import { LightsModule } from './lights/lights.module';
import { HomeImprovementModule } from './home-improvement/home-improvement.module';
import { DevicesFactory } from './devices.factory';
import { DevicesSagas } from './devices.sagas';
import { GetDeviceQuery } from './cqrs/queries';
import { DevicesService } from './devices.service';
import {
  HandleDeviceConfigCommandHandler,
  LinkDeviceProductCommandHandler,
  UpdateDeviceStatusCommandHandler,
  SetLightEffctsCommandHandler,
} from './cqrs/handlers';

@Module({
  imports: [DataModule, AppliancesModule, HomeImprovementModule, LightsModule],
  providers: [
    DevicesService,
    DevicesFactory,
    DevicesSagas,
    HandleDeviceConfigCommandHandler,
    LinkDeviceProductCommandHandler,
    GetDeviceQuery,
    UpdateDeviceStatusCommandHandler,
    SetLightEffctsCommandHandler,
  ],
  exports: [
    DevicesService,
    DevicesSagas,
    HandleDeviceConfigCommandHandler,
    LinkDeviceProductCommandHandler,
    GetDeviceQuery,
    UpdateDeviceStatusCommandHandler,
    SetLightEffctsCommandHandler,
  ],
})
export class DevicesModule {}
