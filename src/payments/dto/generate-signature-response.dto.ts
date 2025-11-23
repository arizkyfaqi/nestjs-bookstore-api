import { ApiProperty } from '@nestjs/swagger';

export class GenerateSignatureResponseDto {
  @ApiProperty({
    description: 'ID transaksi yang digunakan untuk membuat signature',
    example: '934a21cf-a506-4b91-8182-02af214b7a87',
  })
  transactionId: string;

  @ApiProperty({
    description: 'Status transaksi yang dipakai dalam payload signature',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description:
      'Signature (sha256 hex) yang di-generate. Gunakan signature ini untuk verifikasi payload pada payment callback.',
    example: '90b494a49b1cb2da5e7cafbd4041b5d0f7cc849286ec1c873b088a53595d8343',
  })
  signature: string;
}
