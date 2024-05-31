import { Expose, Type } from 'class-transformer';
import { ComponentResponse } from './component.response';
import { FeastResponse } from './feast.response';

export class FeastComponentResponse extends ComponentResponse {
  @Expose({ name: 'feasts' })
  @Type(() => FeastResponse)
  feasts!: [];

  @Expose({ name: 'h5Url' })
  h5Url?: string;

  @Expose({ name: 'feastType' })
  feastType!: number;

  @Expose({ name: 'videoUrl' })
  videoUrl?: string;
}
