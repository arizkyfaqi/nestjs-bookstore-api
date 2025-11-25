import { Module } from '@nestjs/common';
import { CartService } from './providers/cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart-item.entity';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { RedisModule } from 'src/shared/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Book, User])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
