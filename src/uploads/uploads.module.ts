import { Module } from '@nestjs/common';
import { UploadsService } from './providers/uploads.service';

@Module({
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
