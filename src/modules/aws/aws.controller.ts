import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.awsService.uploadMediaFile(file);
  }

  @Post('/upload-multiple')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.awsService.uploadMediaFiles(files);
  }
}
