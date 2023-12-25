import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoveeAPIModule } from './data';

@Module({
  imports: [GoveeAPIModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
