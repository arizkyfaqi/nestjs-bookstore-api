import { ApiProperty } from '@nestjs/swagger';

export class AdminAllTransactionsResponseDto {
  @ApiProperty({
    description: 'Total jumlah transaksi di sistem',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'List semua transaksi dengan user dan item detail',
    type: 'array',
  })
  transactions: any[];
}
