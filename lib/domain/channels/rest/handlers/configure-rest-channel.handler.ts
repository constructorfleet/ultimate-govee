import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigureRestChannelCommand } from '../commands';
import { RestChannelService } from '../rest-channel.service';

@CommandHandler(ConfigureRestChannelCommand)
export class ConfigureRestChannelCommandHandler
  implements ICommandHandler<ConfigureRestChannelCommand, void>
{
  private readonly logger: Logger = new Logger(
    ConfigureRestChannelCommandHandler.name,
  );
  constructor(private readonly restChannel: RestChannelService) {}

  async execute(command: ConfigureRestChannelCommand): Promise<void> {
    this.logger.log('Setting config');
    return await this.restChannel.setConfig(command.config);
  }
}
