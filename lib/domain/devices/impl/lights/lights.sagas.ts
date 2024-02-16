import { Injectable } from '@nestjs/common';
import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { RetrieveLightEffectsCommand } from '@constructorfleet/ultimate-govee/domain/channels/rest/commands/retrieve-light-effects.command';
import { Observable, filter, map } from 'rxjs';
import {
  DeviceDiscoveredEvent,
  LightEffectsReceivedEvent,
  SetLightEffectsCommand,
} from '../../cqrs';
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

  @Saga()
  effectsReceivedFlow = (events$: Observable<any>): Observable<ICommand> =>
    events$.pipe(
      ofType(LightEffectsReceivedEvent),
      map((event) => new SetLightEffectsCommand(event.deviceId, event.effects)),
    );
}
