import { Expose } from 'class-transformer';

export class GoveeAPIResponse {
  @Expose({ name: 'message' })
  message!: string;

  @Expose({ name: 'status' })
  status!: number;
}
