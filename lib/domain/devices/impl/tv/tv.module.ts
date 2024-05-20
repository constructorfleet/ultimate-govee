import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SyncBoxModule } from './sync-box/sync-box.module';
import { TVFactory } from './tv.factory';
import { DreamviewModule } from './dreamview/dreamview.module';

@Module({
  imports: [CqrsModule, SyncBoxModule, DreamviewModule],
  providers: [TVFactory],
  exports: [TVFactory],
})
export class TVModule {}
