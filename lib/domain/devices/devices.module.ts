import { Module } from '@nestjs/common';
import { AppliancesModule } from './impl/appliances/appliances.module';
import { LightsModule } from './impl/lights/lights.module';
import { HomeImprovementModule } from './impl/home-improvement/home-improvement.module';
import { DevicesFactory } from './devices.factory';
import { DevicesService } from './devices.service';
import { UpdateDeviceStatusCommandHandler } from './cqrs/handlers/update-device-status.handler';
import { DeviceController } from './device.controller';
import { DeviceConfigReceivedEventHandler } from './cqrs/handlers/device-config-received.handler';
import { LightEffectsReceivedEventHandler } from './cqrs/handlers/light-effects-received.handler';
import { GetDeviceQueryHandler } from './cqrs/handlers/get-device.handler';

@Module({
  imports: [AppliancesModule, HomeImprovementModule, LightsModule],
  controllers: [DeviceController],
  providers: [
    DevicesService,
    DevicesFactory,
    GetDeviceQueryHandler,
    DeviceConfigReceivedEventHandler,
    LightEffectsReceivedEventHandler,
    UpdateDeviceStatusCommandHandler,
  ],
  exports: [
    DevicesService,
    DevicesFactory,
    GetDeviceQueryHandler,
    DeviceConfigReceivedEventHandler,
    LightEffectsReceivedEventHandler,
    UpdateDeviceStatusCommandHandler,
  ],
})
export class DevicesModule {}
