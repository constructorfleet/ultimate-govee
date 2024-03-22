import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SyncBoxModule } from './sync-box/sync-box.module';
import { TVFactory } from './tv.factory';

@Module({
  imports: [CqrsModule, SyncBoxModule],
  providers: [TVFactory],
  exports: [TVFactory],
})
export class TVModule {}
