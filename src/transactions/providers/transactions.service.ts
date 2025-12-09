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
import { ReqOrdersDto } from '../dto/req-orders.dto';
import { ResPaginatinDto } from 'src/utils/dto/res-pagination.dto';
import { PageMetaDto } from 'src/utils/dto/page-meta.dto';

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

    const cartItems = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['book'],
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // run transaction to lock rows and persist atomic changes
    const result = await this.dataSource.transaction(async (manager) => {
      // Re-load cart items with manager to ensure same transactional connection (optional)
      const cartRepoTx = manager.getRepository(CartItem);
      const bookRepoTx = manager.getRepository(Book);
      const trxRepoTx = manager.getRepository(Transaction);
      const trxItemRepoTx = manager.getRepository(TransactionItem);

      // Re-fetch cart items inside transaction and lock them (pessimistic_read to ensure stable view)
      const cartItemsTx = await cartRepoTx
        .createQueryBuilder('cart')
        .innerJoinAndSelect('cart.book', 'book')
        .innerJoin('cart.user', 'user')
        .where('user.id = :userId', { userId })
        .setLock('pessimistic_write')
        .getMany();

      if (!cartItemsTx || cartItemsTx.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let totalAmount = 0;
      const trx = new Transaction();
      trx.user = user;
      trx.paymentStatus = PaymentStatus.PENDING;
      trx.items = [];

      for (const ci of cartItemsTx) {
        const book = await bookRepoTx.findOne({
          where: { id: ci.book.id },
          lock: { mode: 'pessimistic_write' }, // FOR UPDATE
        });

        if (!book) throw new NotFoundException('Book not found: ' + ci.book.id);

        // Validate stock
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

      const savedTrx = await trxRepoTx.save(trx);

      // If TransactionItem not cascaded, ensure they reference transaction and are saved:
      for (const item of trx.items) {
        item.transaction = savedTrx;
        await trxItemRepoTx.save(item);
      }

      // Remove cart items
      const cartIds = cartItemsTx.map((c) => c.id);
      if (cartIds.length) {
        await cartRepoTx.delete(cartIds);
      }

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

      return data;
    });

    return new ResObjDto(result, HttpStatus.OK, 'Success');
  }

  async findByUser(
    userId: string,
    pageOptionsDto: ReqOrdersDto,
  ): Promise<ResPaginatinDto<any>> {
    const [data, itemCount] = await this.transactionRepo.findAndCount({
      where: { user: { id: userId } },
      relations: ['items', 'items.book'],
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      order: { createdAt: 'DESC' },
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new ResPaginatinDto(data, pageMetaDto);
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
