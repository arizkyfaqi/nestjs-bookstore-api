import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from '../cart-item.entity';
import { Book } from 'src/books/book.entity';
import { User } from 'src/users/user.entity';
import { AddToCartDto } from '../dto/add-to-cart.dto';
import { UpdateCartDto } from '../dto/update-cart.dto';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { ResMsgDto } from 'src/utils/dto/res-msg.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepo: Repository<CartItem>,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async addToCart(
    user_: TokenPayload,
    dto: AddToCartDto,
  ): Promise<ResObjDto<any>> {
    const user = await this.userRepo.findOne({ where: { id: user_.userId } });
    return await this.dataSource.transaction(async (manager) => {
      const book = await manager.getRepository(Book).findOne({
        where: { id: dto.bookId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) throw new NotFoundException('Book not found');

      // Validasi stock
      if (book.stock < dto.quantity) {
        throw new BadRequestException('Not enough stock');
      }

      // Lock cart item milik user + book (hindari double insert)
      let cartItem = await manager.getRepository(CartItem).findOne({
        where: {
          user: { id: user?.id },
          book: { id: dto.bookId },
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cartItem) {
        cartItem = manager.getRepository(CartItem).create({
          user: { id: user?.id },
          book: { id: dto.bookId },
          quantity: dto.quantity,
        });
      } else {
        const newQty = cartItem.quantity + dto.quantity;

        if (newQty > book.stock) {
          throw new BadRequestException('Stock not enough');
        }

        cartItem.quantity = newQty;
      }

      // Simpan cart item
      const saveCart = await manager.getRepository(CartItem).save(cartItem);
      const data: any = {
        id: saveCart.id,
        userId: saveCart.userId,
        bookId: saveCart.bookId,
        quantity: saveCart.quantity,
        createdAt: saveCart.createdAt,
      };

      return new ResObjDto(data, HttpStatus.OK, 'Success');
    });
  }

  async getCart(user: TokenPayload): Promise<ResObjDto<any>> {
    const cart = await this.cartRepo.find({
      where: { user: { id: user.userId } },
    });
    return new ResObjDto(cart, HttpStatus.OK, 'Success');
  }

  async updateCartItem(
    user: TokenPayload,
    itemId: string,
    dto: UpdateCartDto,
  ): Promise<ResObjDto<any>> {
    return await this.dataSource.transaction(async (manager) => {
      // Ambil cart item tanpa JOIN
      const cartItem = await manager
        .getRepository(CartItem)
        .createQueryBuilder('cart')
        .where('cart.id = :itemId', { itemId })
        .andWhere('cart.userId = :userId', { userId: user.userId })
        .setLock('pessimistic_write')
        .getOne();

      if (!cartItem) throw new NotFoundException('Cart item not found');

      // Load book manual (tanpa join)
      const bookNmbr = Number(cartItem.bookId);
      const book = await manager.getRepository(Book).findOne({
        where: { id: bookNmbr },
      });

      if (!book) throw new NotFoundException('Book not found');

      if (dto.quantity > book.stock) {
        throw new BadRequestException('Not enough stock');
      }

      cartItem.quantity = dto.quantity;

      const saveCart = await manager.getRepository(CartItem).save(cartItem);

      const data: any = {
        id: saveCart.id,
        userId: saveCart.userId,
        bookId: saveCart.bookId,
        quantity: saveCart.quantity,
        createdAt: saveCart.createdAt,
      };

      return new ResObjDto(data, HttpStatus.OK, 'Success');
    });
  }
  async removeItem(user: TokenPayload, itemId: string): Promise<ResMsgDto> {
    return await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(CartItem).delete({
        id: itemId,
        user: { id: user.userId },
      });

      return new ResMsgDto(HttpStatus.OK, 'Removed');
    });
  }
}
