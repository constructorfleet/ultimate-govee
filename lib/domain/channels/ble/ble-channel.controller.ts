import { Controller, Post, Query } from '@nestjs/common';
import { BleChannelService } from './ble-channel.service';

@Controller('ble')
export class BleChannelController {
  constructor(private readonly service: BleChannelService) {}

  @Post('config')
  setBleConfig(@Query('enabled') enabled: boolean) {
    this.service.setEnabled(enabled);
  }
}
