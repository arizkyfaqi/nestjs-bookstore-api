import { Module } from '@nestjs/common';
import { TransactionsService } from './providers/transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionItem } from './transaction-item.entity';
import { CartItem } from 'src/cart/cart-item.entity';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { AdminTransactionsController } from './admin-transactions.controller';
import { AdminTransactionsService } from './providers/admin-transactions.service';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionItem,
      CartItem,
      Book,
      User,
    ]),
    RedisModule,
  ],
  providers: [TransactionsService, AdminTransactionsService],
  controllers: [TransactionsController, AdminTransactionsController],
})
export class TransactionsModule {}
