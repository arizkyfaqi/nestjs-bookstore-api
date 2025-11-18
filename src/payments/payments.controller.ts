import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentsService } from './payments/payments.service';
import { GenerateSignatureDto } from './dto/generate-signature.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('callback')
  @HttpCode(200)
  async handleCallback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.processCallback(dto);
  }

  @Post('/generate-signature')
  generateSignature(@Body() dto: GenerateSignatureDto) {
    return this.paymentsService.generateSignature(dto);
  }
}
