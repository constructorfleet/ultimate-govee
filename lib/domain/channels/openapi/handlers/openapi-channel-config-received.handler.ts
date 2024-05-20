import { OpenAPIChannelConfigReceivedEvent } from '../events/openapi-channel-config-received.event';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OpenApiChannelService } from '../openapi-channel.service';

@EventsHandler(OpenAPIChannelConfigReceivedEvent)
export class OpenAPIChannelConfigReceivedEventHandler
  implements IEventHandler<OpenAPIChannelConfigReceivedEvent>
{
  constructor(private readonly service: OpenApiChannelService) {}

  handle(event: OpenAPIChannelConfigReceivedEvent) {
    this.service.setConfig(event.config);
  }
}
