import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ description: 'Book title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Author name' })
  @IsString()
  author: string;

  @ApiProperty({ description: 'Book description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Number of books in stock' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'Price of the book' })
  @IsNumber()
  @Min(0)
  price: number;
}
