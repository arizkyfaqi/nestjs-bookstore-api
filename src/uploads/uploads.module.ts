import { Module } from '@nestjs/common';
import { UploadsService } from './providers/uploads.service';

@Module({
  providers: [UploadsService]
})
export class UploadsModule {}
