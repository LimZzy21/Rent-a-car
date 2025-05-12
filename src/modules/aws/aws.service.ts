import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AwsService {
  private client: S3Client;
  private bucketName = this.configService.get('S3_BUCKET_NAME');

  constructor(private readonly configService: ConfigService) {
    const awsRegion = this.configService.get('AWS_REGION');
    const awsAccessKey = this.configService.get('AWS_ACCESS_KEY');
    const awsSecretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    if (!awsRegion || !awsAccessKey || !awsSecretKey) {
      throw new InternalServerErrorException('Missing one or more required AWS environment variables');
    }

    this.client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadMediaFile(file: Express.Multer.File) {
    try {
      const key = uuidv4();

      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9-_]/g, '_');

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          originalName: sanitizedOriginalName,
        },
      });

      await this.client.send(command);

      return {
        url: this.getMediaFileUrl(key).url,
        key,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  getMediaFileUrl(key: string) {
    return { url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async deleteMediaByKey(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
