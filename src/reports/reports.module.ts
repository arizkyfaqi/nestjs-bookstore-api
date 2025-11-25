import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './providers/reports/reports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionItem } from 'src/transactions/transaction-item.entity';
import { Book } from 'src/books/book.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionItem, Book]), RedisModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
