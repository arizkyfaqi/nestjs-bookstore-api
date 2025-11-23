import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentsService } from './payments/payments.service';
import { GenerateSignatureDto } from './dto/generate-signature.dto';
import { GenerateSignatureResponseDto } from './dto/generate-signature-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentCallbackResponseDto } from './dto/payment-callback-response.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('callback')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Payment gateway callback',
    description:
      'Menerima notifikasi dari provider pembayaran. Endpoint memvalidasi signature dan mengubah status transaksi. ' +
      'Response dikembalikan sebagai objek wrapper (ResObjDto) dengan field data berisi { message, transactionId, status }. ',
  })
  @ApiResponse({
    status: 200,
    description:
      'Payment berhasil diproses. Data inner berisi message, transactionId, dan status transaksi.',
    type: PaymentCallbackResponseDto,
  })
  async handleCallback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.processCallback(dto);
  }

  @Post('/generate-signature')
  @ApiOperation({
    summary: 'Generate signature untuk request pembayaran',
    description:
      'Menghasilkan signature berdasarkan transactionId + status + PAYMENT_SECRET. \n' +
      'Kembalian berisi { transactionId, status, signature } — signature ini dapat digunakan oleh client atau provider untuk \n' +
      'menandatangani callback sehingga server dapat memverifikasi integritas payload saat callback diterima.',
  })
  @ApiResponse({
    status: 200,
    description: 'Signature dibuat. Kirim signature ini bersama callback.',
    type: GenerateSignatureResponseDto,
  })
  generateSignature(@Body() dto: GenerateSignatureDto) {
    return this.paymentsService.generateSignature(dto);
  }
}
