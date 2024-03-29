import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { RetrieveLightEffectsCommand } from '../../../channels/rest/commands/retrieve-light-effects.command';
import { Observable, filter, map } from 'rxjs';
import { DeviceDiscoveredEvent } from '../../cqrs/events/device-discovered.event';
import { LightDevice } from './light.device';

@Injectable()
export class LightsSagas {
  @Saga()
  deviceDiscoveredFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(DeviceDiscoveredEvent),
      filter(
        (event: DeviceDiscoveredEvent) => event.device instanceof LightDevice,
      ),
      map(
        (event: DeviceDiscoveredEvent) =>
          new RetrieveLightEffectsCommand(event.device),
      ),
    );
}
