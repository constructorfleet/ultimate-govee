import { Module } from '@nestjs/common';
import { PresenceFactory } from './presence';

@Module({
  providers: [PresenceFactory],
  exports: [PresenceFactory],
})
export class PresenceModule {}
