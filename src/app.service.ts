import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SetCredentialsCommand } from '@govee/domain/auth';
import { Password, Username } from '@govee/common';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(private readonly commandBus: CommandBus) {}

  async connect(username: Username, password: Password) {
    this.logger.log('Issuing authenticate command');
    const result = await this.commandBus.execute(
      new SetCredentialsCommand({
        username,
        password,
      }),
    );
    this.logger.log(`Result ${result}`);
  }
}
