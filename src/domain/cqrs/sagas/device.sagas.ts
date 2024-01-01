/* eslint-disable class-methods-use-this */
import { Injectable, Logger } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { AccountAuthenticatedEvent } from '../events/account/account-authenticated.event';
import { GetDevicesCommand } from '../commands/device/get-devices.command';

@Injectable()
export class DeviceSagas {
  private readonly logger: Logger = new Logger(DeviceSagas.name);

  @Saga()
  listDevices(events$: Observable<any>): Observable<ICommand> {
    return events$.pipe(
      ofType(AccountAuthenticatedEvent),
      map(() => new GetDevicesCommand()),
    );
  }
}
