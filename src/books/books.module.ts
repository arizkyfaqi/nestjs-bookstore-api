import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './providers/books.service';
import { Book } from './book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsModule } from 'src/uploads/uploads.module';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [TypeOrmModule.forFeature([Book]), UploadsModule, RedisModule],
})
export class BooksModule {}
