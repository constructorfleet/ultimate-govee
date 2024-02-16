import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoveeAccountService } from '@constructorfleet/ultimate-govee/data';
import { RefreshAuthenticationCommand } from '../commands';
import { AuthService } from '../auth.service';
import { filter, from, map } from 'rxjs';

@CommandHandler(RefreshAuthenticationCommand)
export class RefreshAuthenticationCommandHandler
  implements ICommandHandler<RefreshAuthenticationCommand>
{
  constructor(
    private readonly goveeApi: GoveeAccountService,
    private readonly authService: AuthService,
  ) {}

  async execute(command: RefreshAuthenticationCommand): Promise<any> {
    from(this.goveeApi.refresh(command.oauth))
      .pipe(
        filter((oauthData) => oauthData !== undefined),
        map((oauthData) => oauthData!),
        map((oauthData) => ({
          accountId: command.accountId,
          clientId: command.clientId,
          oauth: oauthData,
        })),
      )
      .subscribe((authData) => this.authService.setAuthData(authData));
  }
}
