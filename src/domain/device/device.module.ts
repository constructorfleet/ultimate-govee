import { Module } from '@nestjs/common';
import { ProductModule } from './product';
import { DeviceService } from './device.service';
import { DeviceStore } from './device.store';
import { DeviceDiscoveredHandler, DeviceProductHandler } from './handlers';

@Module({
  imports: [ProductModule],
  providers: [
    DeviceStore,
    DeviceService,
    DeviceDiscoveredHandler,
    DeviceProductHandler,
  ],
  exports: [DeviceService],
})
export class DeviceModule {}
