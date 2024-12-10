import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { ComponentResponse } from './component.response';
import { EnvironmentComponent } from './environment-component.response';
import { OneClickComponent } from './one-click-component.response';
import { FeastComponentResponse } from './feast-component.response';
import { GoveeAPIResponse } from '../../../govee-api.models';

export class ComponentsResponse {
  @Expose({ name: 'components' })
  @Transform(({ value }) =>
    (value ?? []).map((v) =>
      'environments' in v
        ? plainToInstance(EnvironmentComponent, v)
        : 'oneClicks' in v
          ? plainToInstance(OneClickComponent, v)
          : 'feasts' in v
            ? plainToInstance(FeastComponentResponse, v)
            : v,
    ),
  )
  components!: ComponentResponse[];
}

export class TapToRunResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => ComponentsResponse)
  componentData!: ComponentsResponse;
}
