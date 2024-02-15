import { Module } from '@nestjs/common';
import { DataModule } from '@constructorfleet/ultimate-govee/data';
import { AppliancesModule } from './impl/appliances/appliances.module';
import { LightsModule } from './impl/lights/lights.module';
import { HomeImprovementModule } from './impl/home-improvement/home-improvement.module';
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
import { DeviceController } from './device.controller';

@Module({
  imports: [DataModule, AppliancesModule, HomeImprovementModule, LightsModule],
  controllers: [DeviceController],
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
