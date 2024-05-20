import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigureOpenAPIChannelCommand } from '../commands';
import { OpenApiChannelService } from '../openapi-channel.service';

@CommandHandler(ConfigureOpenAPIChannelCommand)
export class ConfigureOpenAPIChannelCommandHandler
  implements ICommandHandler<ConfigureOpenAPIChannelCommand, void>
{
  constructor(private readonly channel: OpenApiChannelService) {}

  async execute(command: ConfigureOpenAPIChannelCommand): Promise<void> {
    await this.channel.setConfig(command.config);
  }
}
