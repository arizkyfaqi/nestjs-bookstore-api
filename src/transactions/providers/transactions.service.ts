import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CartItem } from 'src/cart/cart-item.entity';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { TransactionItem } from '../transaction-item.entity';
import { Transaction } from '../transaction.entity';
import { PaymentStatus } from '../enum/payment-status.enum';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(TransactionItem)
    private readonly transactionItemRepo: Repository<TransactionItem>,

    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async checkout(userId: string): Promise<ResObjDto<any>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // CHECK cart (outside transaction)
    const rawCart = await this.cartRepo.find({
      where: { user: { id: userId } },
    });

    if (rawCart.length === 0) throw new BadRequestException('Cart is empty');

    return await this.dataSource.transaction(async (manager) => {
      const cartRepoTx = manager.getRepository(CartItem);
      const bookRepoTx = manager.getRepository(Book);
      const trxRepoTx = manager.getRepository(Transaction);
      const trxItemRepoTx = manager.getRepository(TransactionItem);

      const cartItemsTx = await cartRepoTx.find({
        where: { user: { id: userId } },
        lock: { mode: 'pessimistic_read' },
      });

      if (cartItemsTx.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Prepare transaction
      let totalAmount = 0;
      const trx = new Transaction();
      trx.user = user;
      trx.paymentStatus = PaymentStatus.PENDING;
      trx.items = [];

      for (const ci of cartItemsTx) {
        const book = await bookRepoTx.findOne({
          where: { id: ci.bookId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!book) throw new NotFoundException('Book not found');

        if (book.stock < ci.quantity) {
          throw new BadRequestException(
            `Insufficient stock for book ${book.title}`,
          );
        }

        // Deduct stock
        book.stock -= ci.quantity;
        await bookRepoTx.save(book);

        // Create transaction item
        const tItem = new TransactionItem();
        tItem.book = book;
        tItem.quantity = ci.quantity;
        tItem.price = book.price;

        trx.items.push(tItem);

        totalAmount += Number(book.price) * ci.quantity;
      }

      trx.totalAmount = totalAmount;

      // Save transaction
      const savedTrx = await trxRepoTx.save(trx);

      // Save transaction items
      for (const item of trx.items) {
        item.transaction = savedTrx;
        await trxItemRepoTx.save(item);
      }

      // Delete cart items
      const cartIds = cartItemsTx.map((c) => c.id);
      await cartRepoTx.delete(cartIds);

      const data: any = {
        id: savedTrx.id,
        totalAmount: savedTrx.totalAmount,
        paymentStatus: savedTrx.paymentStatus,
        createdAt: savedTrx.createdAt,
        items: savedTrx.items.map((item) => ({
          id: item.id,
          bookId: item.book.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      return new ResObjDto(data, HttpStatus.OK, 'Success');
    });
  }

  async findByUser(userId: string): Promise<ResObjDto<any>> {
    const order = await this.transactionRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.book'],
      order: { createdAt: 'DESC' },
    });
    return new ResObjDto(order, HttpStatus.OK, 'Success');
  }

  async findOneForUser(
    orderId: string,
    userId: string,
  ): Promise<ResObjDto<any>> {
    const order = await this.transactionRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['items', 'items.book'],
    });
    return new ResObjDto(order, HttpStatus.OK, 'Success');
  }
}
