import { Expose, Type } from 'class-transformer';
import { ComponentResponse } from './component.response';
import { OneClickResponse } from './one-click.response';

export class OneClickComponent extends ComponentResponse {
  @Expose({ name: 'name' })
  guideUrl?: string;

  @Expose({ name: 'oneClicks' })
  @Type(() => OneClickResponse)
  oneClicks!: OneClickResponse[];
}
