import { Module } from '@nestjs/common';
import { SyncBoxFactory } from './sync-box';

@Module({
  providers: [SyncBoxFactory],
  exports: [SyncBoxFactory],
})
export class SyncBoxModule {}
