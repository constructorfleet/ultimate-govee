import { Controller, Post, Query } from '@nestjs/common';
import { OpenApiChannelService } from './openapi-channel.service';

@Controller('openapi')
export class OpenAPIChannelController {
  constructor(private readonly service: OpenApiChannelService) {}

  @Post('config')
  setIoTConfig(
    @Query('enabled') enabled: boolean,
    @Query('apiKey') apiKey?: string,
  ) {
    this.service.setEnabled(enabled);
    if (apiKey) {
      this.service.connect({ apiKey });
    }
  }
}
