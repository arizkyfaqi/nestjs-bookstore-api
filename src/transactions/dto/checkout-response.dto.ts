import { ApiProperty } from '@nestjs/swagger';

export class CheckoutResponseDto {
  @ApiProperty({
    description: 'ID transaksi yang dibuat',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Total harga transaksi (sum dari semua item)',
    example: 150000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Status pembayaran transaksi',
    example: 'PENDING',
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Waktu transaksi dibuat',
    example: '2025-11-19T03:44:51.704Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Detail item yang dibeli dalam transaksi',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        bookId: { type: 'number' },
        quantity: { type: 'number' },
        price: { type: 'number' },
      },
    },
  })
  items: Array<{
    id: string;
    bookId: number;
    quantity: number;
    price: number;
  }>;
}
