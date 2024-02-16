import { Module } from '@nestjs/common';
import { OpenAPIConfig } from './openapi.config';
import { OpenAPIService } from './openapi.service';

@Module({
  imports: [],
  providers: [OpenAPIConfig, OpenAPIService],
  exports: [OpenAPIService],
})
export class OpenAPIModule {}
