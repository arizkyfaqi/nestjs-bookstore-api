import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './providers/books.service';
import { Book } from './book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [TypeOrmModule.forFeature([Book])],
})
export class BooksModule {}
