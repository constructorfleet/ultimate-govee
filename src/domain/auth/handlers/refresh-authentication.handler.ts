import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoveeAccountService } from '@govee/data';
import { RefreshAuthenticationCommand } from '../commands';
import { AuthService } from '../auth.service';

@CommandHandler(RefreshAuthenticationCommand)
export class RefreshAuthenticationCommandHandler
  implements ICommandHandler<RefreshAuthenticationCommand>
{
  constructor(
    private readonly goveeApi: GoveeAccountService,
    private readonly authService: AuthService,
  ) {}

  async execute(command: RefreshAuthenticationCommand): Promise<any> {
    const oauth = await this.goveeApi.refresh(command.oauth);
    if (!oauth) {
      return false;
    }
    this.authService.setAuthData({
      accountId: command.accountId,
      clientId: command.clientId,
      oauth,
    });
    return true;
  }
}
