import { Module } from '@nestjs/common';
import {AwsService} from './aws.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AwsService],
  exports: [AwsService],
})
export class AwsModule {}
