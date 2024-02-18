import { Controller, Post, Query } from '@nestjs/common';
import { IoTChannelService } from './iot-channel.service';

@Controller('iot')
export class IoTChannelController {
  constructor(private readonly service: IoTChannelService) {}

  @Post('config')
  setIoTConfig(@Query('enabled') enabled: boolean) {
    this.service.setEnabled(enabled);
  }
}
