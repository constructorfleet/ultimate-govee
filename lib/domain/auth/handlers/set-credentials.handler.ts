import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetCredentialsCommand } from '../commands';
import { AuthService } from '../auth.service';

@CommandHandler(SetCredentialsCommand)
export class SetCredentialsCommandHandler
  implements ICommandHandler<SetCredentialsCommand>
{
  constructor(private readonly authService: AuthService) {}

  async execute(command: SetCredentialsCommand): Promise<any> {
    await this.authService.setCredentials(command.credentials);
  }
}
