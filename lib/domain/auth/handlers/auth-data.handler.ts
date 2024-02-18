import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AuthDataQuery } from '../queries/auth-data.query';
import { AuthService } from '../auth.service';

@QueryHandler(AuthDataQuery)
export class AuthDataQueryHandler implements IQueryHandler<AuthDataQuery> {
  private readonly logger: Logger = new Logger(AuthDataQueryHandler.name);

  constructor(private readonly authService: AuthService) {}

  async execute(_: AuthDataQuery): Promise<any> {
    return this.authService.accountAuth;
  }
}
