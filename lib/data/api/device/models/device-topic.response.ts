import { Expose } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class DeviceTopicResponse extends GoveeAPIResponse {
  @Expose({ name: 'topic' })
  iotTopic?: string;
}
