import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly repo: Repository<Book>,
  ) {}

  async findAll(user: TokenPayload) {
    const condition = { stock: MoreThan(0) };
    let book = await this.repo.find();
    if (user.role == RoleType.CUSTOMER) {
      book = await this.repo.find({ where: condition });
    }
    return book;
  }

  async findOne(id: number) {
    const book = await this.repo.findOne({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(dto: CreateBookDto, cover?: Express.Multer.File) {
    let coverUrl: string = '';
    let thumbUrl: string = '';

    if (cover) {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const filename = `${Date.now()}-${cover.originalname}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, cover.buffer);

      const thumbName = `thumb-${filename}`;
      const thumbPath = path.join(uploadDir, thumbName);
      await sharp(cover.buffer).resize(200, 300).toFile(thumbPath);

      coverUrl = `/uploads/${filename}`;
      thumbUrl = `/uploads/${thumbName}`;
    }

    const book = this.repo.create({ ...dto, coverUrl, thumbnailUrl: thumbUrl });
    return this.repo.save(book);
  }

  async update(id: number, dto: UpdateBookDto) {
    const book = await this.findOne(id);
    Object.assign(book, dto);
    return this.repo.save(book);
  }

  async updateStock(id: number, amount: number) {
    const book = await this.findOne(id);
    book.stock += amount;
    if (book.stock < 0) book.stock = 0;
    return this.repo.save(book);
  }

  async remove(id: number) {
    const book = await this.findOne(id);
    return this.repo.remove(book);
  }
}
