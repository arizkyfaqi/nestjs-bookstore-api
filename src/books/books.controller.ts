import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './providers/books.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Express } from 'express';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeaders,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateStockBookDto } from './dto/update-stock-book';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { memoryStorage } from 'multer';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Controller('books')
@ApiBearerAuth('access-token')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  findAll(@CurrentUser() user: TokenPayload): Promise<ResObjDto<any>> {
    return this.booksService.findAll(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<ResObjDto<any>> {
    const book = await this.booksService.findOne(id);
    return new ResObjDto(book, HttpStatus.OK, 'Success');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, cb) => {
        if (IMAGE_MIME_TYPES.includes(file.mimetype)) cb(null, true);
        else
          cb(
            new Error('Unsupported file type. Only jpeg, png, webp allowed.'),
            false,
          );
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body() dto: CreateBookDto,
    @UploadedFile() cover?: Express.Multer.File,
  ): Promise<ResObjDto<any>> {
    return this.booksService.create(dto, cover);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(id, dto);
  }

  @Patch(':id/stock')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update stock',
    description: 'Update stock buku',
  })
  updateStock(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateStockBookDto,
  ) {
    return this.booksService.updateStock(id, dto.amount);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.booksService.remove(id);
  }
}
