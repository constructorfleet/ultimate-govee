import { Expose } from 'class-transformer';

export class LoginRequest {
  @Expose({ name: 'email', toPlainOnly: true })
  username!: string;

  @Expose({ name: 'password', toPlainOnly: true })
  password!: string;

  @Expose({ name: 'client', toPlainOnly: true })
  clientId!: string;
}
