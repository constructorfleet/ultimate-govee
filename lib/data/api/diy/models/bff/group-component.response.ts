import { Expose } from 'class-transformer';
import { ComponentResponse } from './component.response';

export class GroupComponentResponse extends ComponentResponse {
  @Expose({ name: 'groups' })
  groups: [];

  @Expose({ name: 'guideUrl' })
  guideUrl?: string;
}
