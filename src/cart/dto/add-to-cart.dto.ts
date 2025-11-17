import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
