import { Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class IoTCertificateData {
  @Expose({ name: 'endpoint' })
  brokerUrl!: string;

  @Expose({ name: 'p12' })
  p12Certificate!: string;

  @Expose({ name: 'p12Pass' })
  certificatePassword!: string;
}

export class IoTCertificateResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => IoTCertificateData)
  data!: IoTCertificateData;
}
