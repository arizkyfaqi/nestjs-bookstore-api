import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from 'src/books/book.entity';
import { ReqReportsDto } from 'src/reports/dto/req-reports.dto';
import { TransactionItem } from 'src/transactions/transaction-item.entity';
import { PageMetaDto } from 'src/utils/dto/page-meta.dto';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { ResPaginatinDto } from 'src/utils/dto/res-pagination.dto';
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
  async getSalesReport(
    pageOptionsDto: ReqReportsDto,
  ): Promise<ResPaginatinDto<any>> {
    const countQuery = await this.trxItemRepo
      .createQueryBuilder('ti')
      .leftJoin('ti.book', 'book')
      .select('COUNT(DISTINCT book.id)', 'total')
      .getRawOne();

    const totalCount = Number(countQuery.total) || 0;

    const reports = await this.trxItemRepo
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
      .orderBy('revenue', 'DESC');

    reports.limit(pageOptionsDto.take).offset(pageOptionsDto.skip);

    const result = await reports.getRawMany();

    const data = result.map((row) => ({
      bookId: row.bookId,
      title: row.title,
      stockRemaining: Number(row.stock),
      quantitySold: Number(row.sold) || 0,
      totalRevenue: Number(row.revenue) || 0,
    }));

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: totalCount,
    });

    return new ResPaginatinDto(data, pageMetaDto);
  }
}
