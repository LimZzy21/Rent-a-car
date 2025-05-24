import { Module } from '@nestjs/common';
import {AwsService} from './aws.service';
import { AwsController } from './aws.controller';
@Module({
  imports: [],
  controllers: [AwsController],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
