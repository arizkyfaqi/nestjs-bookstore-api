import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateSignatureDto {
  @ApiProperty({ example: '934a21cf-a506-4b91-8182-02af214b7a87' })
  @IsString()
  transactionId: string;

  @ApiProperty({ example: 'success | failed | pending' })
  @IsString()
  status: string;
}
