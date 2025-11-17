import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['stock'] as const),
) {
  @ApiPropertyOptional()
  title?: string;

  @ApiPropertyOptional()
  author?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  price?: number;
}
