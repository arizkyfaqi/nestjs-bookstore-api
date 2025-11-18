import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/book.entity';
import { TransactionItem } from 'src/transactions/transaction-item.entity';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(TransactionItem)
    private readonly trxItemRepo: Repository<TransactionItem>,

    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  /**
   * Sales Report (Per Buku)
   * Jumlah Terjual, Stock Tersisa, Total Pendapatan
   */
  async getSalesReport(): Promise<ResObjDto<any>> {
    const result = await this.trxItemRepo
      .createQueryBuilder('ti')
      .leftJoin('ti.book', 'book')
      .select('book.id', 'bookId')
      .addSelect('book.title', 'title')
      .addSelect('book.stock', 'stock')
      .addSelect('SUM(ti.quantity)', 'sold')
      .addSelect('SUM(ti.quantity * ti.price)', 'revenue')
      .groupBy('book.id')
      .addGroupBy('book.title')
      .addGroupBy('book.stock')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    const data = result.map((row) => ({
      bookId: row.bookId,
      title: row.title,
      stockRemaining: Number(row.stock),
      quantitySold: Number(row.sold) || 0,
      totalRevenue: Number(row.revenue) || 0,
    }));

    return new ResObjDto(data, HttpStatus.OK, 'Success');
  }
}
