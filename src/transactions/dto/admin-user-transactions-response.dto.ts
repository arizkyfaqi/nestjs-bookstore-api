import { ApiProperty } from '@nestjs/swagger';

export class AdminUserTransactionsResponseDto {
  @ApiProperty({
    description: 'Informasi user',
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
  };

  @ApiProperty({
    description: 'Total jumlah transaksi user',
    example: 5,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'List transaksi user',
    type: 'array',
  })
  transactions: any[];
}
