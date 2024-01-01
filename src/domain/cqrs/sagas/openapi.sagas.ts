/* eslint-disable class-methods-use-this */
import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { AccountAuthenticatedEvent } from '../events';
import { ConnectOpenAPICommand } from '../commands';

@Injectable()
export class OpenAPISagas {
  private readonly logger: Logger = new Logger(OpenAPISagas.name);

  @Saga()
  authenticated(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(AccountAuthenticatedEvent),
      map((event) => new ConnectOpenAPICommand(event.accessToken)),
    );
  }
}
