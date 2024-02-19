import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoveeAccountService } from '~ultimate-govee/data';
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
    const authdata = await this.goveeApi.refresh(command.oauth);
    if (authdata === undefined) {
      return authdata;
    }
    this.authService.setAuthData({
      accountId: command.accountId,
      clientId: command.clientId,
      oauth: authdata,
    });
  }
}
