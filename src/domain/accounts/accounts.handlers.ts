import { CommandHandler, EventBus, EventsHandler, ICommandHandler, IEventHandler } from "@nestjs/cqrs";
import { AuthenticateCommand, AuthenticatedEvent, RefreshAuthenticationCommand } from "domain/cqrs";
import { AccountService } from "./accounts.service";
import { Logger } from '@nestjs/common';
import { map, timer } from 'rxjs';

@CommandHandler(AuthenticateCommand)
@EventsHandler(AuthenticatedEvent)
export class AuthenticateHandler implements ICommandHandler<AuthenticateCommand> {
  private readonly logger: Logger = new Logger(AuthenticateHandler.name);

  constructor(private readonly accountService: AccountService, private eventBus: EventBus) { }

  async execute(command: AuthenticateCommand): Promise<any> {
    this.logger.log('Authenticating...');
    const state = await this.accountService.authenticate(command.username, command.password, command.clientId);
    if (!state?.oauth) {
      this.logger.log('Authentication failed');
      return;
    }
    this.logger.log(`Publishing AuthenticatedEvent`);
    this.eventBus.publish(new AuthenticatedEvent(
      state.accountId,
      state.clientId,
      state.oauth,
    ));
  }
}

@EventsHandler(AuthenticatedEvent)
export class AuthenticatedHandler implements IEventHandler<AuthenticatedEvent> {
  private readonly logger: Logger = new Logger(AuthenticatedHandler.name);

  constructor(private readonly accountService: AccountService, private readonly eventBus: EventBus) { }

  handle(event: AuthenticatedEvent) {
    timer(2000).subscribe(async () => {
      const state = await this.accountService.refreshToken();
      if (!state?.oauth) {
        this.logger.log('Refresh failed');
        return;
      }
      this.logger.log(`Publishing AuthenticatedEvent`);
      this.eventBus.publish(new AuthenticatedEvent(
        state.accountId,
        state.clientId,
        state.oauth,
      ));
    });
  }
}