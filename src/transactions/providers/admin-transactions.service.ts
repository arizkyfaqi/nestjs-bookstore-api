import {
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transaction.entity';
import { User } from 'src/users/user.entity';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
@Injectable()
export class AdminTransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getAllTransactions(): Promise<ResObjDto<any>> {
    const transactions = await this.transactionRepo
      .createQueryBuilder('trx')
      .innerJoinAndSelect('trx.user', 'user')
      .leftJoinAndSelect('trx.items', 'item')
      .leftJoinAndSelect('item.book', 'book')
      .orderBy('trx.createdAt', 'DESC')
      .getMany();

    const data: any = {
      total: transactions.length,
      transactions,
    };

    return new ResObjDto(data, HttpStatus.OK, 'Success');
  }

  async getUserTransactions(userId: string): Promise<ResObjDto<any>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const transactions = await this.transactionRepo
      .createQueryBuilder('trx')
      .innerJoinAndSelect('trx.user', 'user')
      .leftJoinAndSelect('trx.items', 'item')
      .leftJoinAndSelect('item.book', 'book')
      .where('user.id = :userId', { userId })
      .orderBy('trx.createdAt', 'DESC')
      .getMany();

    const data: any = {
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName + ' ' + user.lastName,
      },
      totalTransactions: transactions.length,
      transactions,
    };

    return new ResObjDto(data, HttpStatus.OK, 'Success');
  }
}
