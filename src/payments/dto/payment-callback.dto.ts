import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';

export class PaymentCallbackDto {
  @ApiProperty({ example: '934a21cf-a506-4b91-8182-02af214b7a87' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'success | failed | pending' })
  @IsString()
  @IsIn(['success', 'failed', 'pending'])
  status: 'success' | 'failed' | 'pending';

  @ApiPropertyOptional({
    example: '90b494a49b1cb2da5e7cafbd4041b5d0f7cc849286ec1c873b088a53595d8343',
  })
  @IsString()
  @IsOptional()
  signature: string;
}
