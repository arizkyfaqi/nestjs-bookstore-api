import { ApiProperty } from '@nestjs/swagger';

export class PaymentCallbackResponseDto {
  @ApiProperty({
    description: 'Pesan hasil pemrosesan callback',
    example: 'Payment processed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'ID transaksi yang diproses',
    example: '934a21cf-a506-4b91-8182-02af214b7a87',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Status pembayaran setelah diproses oleh sistem',
    example: 'SUCCESS',
  })
  status: string;
}
