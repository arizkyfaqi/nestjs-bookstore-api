import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Book } from '../book.entity';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { RoleType } from 'src/utils/constants/role-type';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { ResMsgDto } from 'src/utils/dto/res-msg.dto';
import { UploadsService } from 'src/uploads/providers/uploads.service';
import { ReqBooksDto } from '../dto/req-books.dto';
import { PageMetaDto } from 'src/utils/dto/page-meta.dto';
import { ResPaginatinDto } from 'src/utils/dto/res-pagination.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly repo: Repository<Book>,
    private readonly uploadService: UploadsService,
  ) {}

  async findAll(
    user: TokenPayload,
    pageOptionsDto: ReqBooksDto,
  ): Promise<ResPaginatinDto<any>> {
    let condition: any = {};
    if (user.role == RoleType.CUSTOMER) {
      condition = { stock: MoreThan(0) };
    }

    let [data, itemCount] = await this.repo.findAndCount({
      where: condition,
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      order: { createdAt: 'ASC' },
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto, itemCount });

    return new ResPaginatinDto(data, pageMetaDto);
  }

  async findOne(id: number) {
    const book = await this.repo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(
    dto: CreateBookDto,
    cover?: Express.Multer.File,
  ): Promise<ResObjDto<any>> {
    let coverUrl: string = '';
    let thumbUrl: string = '';

    if (cover) {
      const uploadCover = await this.uploadService.uploadCover(cover);
      coverUrl = uploadCover.coverUrl;
      thumbUrl = uploadCover.thumbUrl;
    }

    const book = this.repo.create({ ...dto, coverUrl, thumbnailUrl: thumbUrl });
    const data = await this.repo.save(book);

    return new ResObjDto(data, HttpStatus.CREATED, 'Success');
  }

  async update(id: number, dto: UpdateBookDto): Promise<ResObjDto<any>> {
    const book = await this.findOne(id);
    Object.assign(book, dto);
    const data = await this.repo.save(book);
    return new ResObjDto(data, HttpStatus.CREATED, 'Success');
  }

  async updateStock(id: number, amount: number): Promise<ResObjDto<any>> {
    const book = await this.findOne(id);
    book.stock += amount;
    if (book.stock < 0) book.stock = 0;
    const data = await this.repo.save(book);
    return new ResObjDto(data, HttpStatus.CREATED, 'Success');
  }

  async remove(id: number): Promise<ResMsgDto> {
    const book = await this.findOne(id);
    await this.repo.remove(book);
    return new ResMsgDto(HttpStatus.OK, 'Success');
  }
}
