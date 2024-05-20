import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OpenAPIModule } from '~ultimate-govee-data';
import {
  OpenAPISubscribeCommandHandler,
  ConfigureOpenAPIChannelCommandHandler,
} from './handlers';
import { OpenApiChannelService } from './openapi-channel.service';
import { OpenAPIChannelController } from './openapi-channel.controller';
import { OpenAPIChannelConfigReceivedEventHandler } from './handlers/openapi-channel-config-received.handler';
import {
  OpenAPIChannelConfigEnabledProvider,
  OpenApiTopicProvider,
} from './openapi-channel.providers';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './openapi-channel.types';

@Module({
  imports: [CqrsModule, OpenAPIModule],
  controllers: [OpenAPIChannelController],
  providers: [
    OpenAPIChannelConfigEnabledProvider,
    ConfigureOpenAPIChannelCommandHandler,
    OpenAPISubscribeCommandHandler,
    OpenAPIChannelConfigReceivedEventHandler,
    OpenApiChannelService,
    OpenApiTopicProvider,
  ],
  exports: [
    ConfigureOpenAPIChannelCommandHandler,
    OpenAPISubscribeCommandHandler,
    OpenAPIChannelConfigReceivedEventHandler,
    OpenApiChannelService,
    MODULE_OPTIONS_TOKEN,
  ],
})
export class OpenAPIChannelModule extends ConfigurableModuleClass {}
