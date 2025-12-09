import { ApiProperty } from '@nestjs/swagger';

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID transaksi/order',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Total harga order',
    example: 150000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Status pembayaran',
    example: 'PENDING',
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Waktu order dibuat',
    example: '2025-11-19T03:44:51.704Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Item-item dalam order',
    type: 'array',
  })
  items: any[];
}
