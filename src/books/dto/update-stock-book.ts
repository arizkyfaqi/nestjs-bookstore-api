import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockBookDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @IsNotEmpty()
  amount: number;
}
