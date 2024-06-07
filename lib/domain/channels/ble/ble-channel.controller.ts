import { Controller, Logger, Post, Query } from '@nestjs/common';
import { BleChannelService } from './ble-channel.service';

@Controller('ble')
export class BleChannelController {
  private readonly logger: Logger = new Logger(BleChannelController.name);
  constructor(private readonly service: BleChannelService) {}

  @Post('config')
  setBleConfig(@Query() query: Record<string, unknown>, @Query('enabled') enabled: boolean) {
    this.logger.debug(query);
    this.logger.debug(enabled);
    this.service.setEnabled(enabled);
  }
}