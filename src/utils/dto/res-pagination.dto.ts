import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from './page-meta.dto';

export class ResPaginatinDto<T> {
  @ApiProperty()
  readonly data: T[];

  @ApiProperty()
  readonly meta: PageMetaDto;

  @ApiProperty()
  readonly statusCode: number;

  @ApiProperty()
  readonly message: string;

  constructor(data: T[], meta: PageMetaDto) {
    this.statusCode = 200;
    this.message = meta.itemCount > 0 ? 'Found' : 'Not Found';
    this.data = data;
    this.meta = meta;
  }
}
