import { Expose, Type } from 'class-transformer';
import { ComponentResponse } from './component.response';
import { EnvironmentResponse } from './environment.response';

export class EnvironmentComponent extends ComponentResponse {
  @Expose({ name: 'environments' })
  @Type(() => EnvironmentResponse)
  devices!: EnvironmentResponse[];
}
