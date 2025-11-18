import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentCallbackDto } from '../dto/payment-callback.dto';
import * as crypto from 'crypto';
import { Transaction } from 'src/transactions/transaction.entity';
import { PaymentStatus } from 'src/transactions/enum/payment-status.enum';
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { GenerateSignatureDto } from '../dto/generate-signature.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  private validateSignature(dto: PaymentCallbackDto): boolean {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    const payload = dto.transactionId + dto.status + secret;

    const expected = crypto.createHash('sha256').update(payload).digest('hex');

    return expected === dto.signature;
  }

  generateSignature(dto: GenerateSignatureDto) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    const payload = dto.transactionId + dto.status + secret;

    const signature = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      transactionId: dto.transactionId,
      status: dto.status,
      signature,
    };
  }

  async processCallback(dto: PaymentCallbackDto): Promise<ResObjDto<any>> {
    // Validate signature
    const isValid = this.validateSignature(dto);
    if (!isValid) {
      throw new BadRequestException('Invalid callback signature');
    }

    // Fetch transaction
    const trx = await this.transactionRepo.findOne({
      where: { id: dto.transactionId },
      relations: ['items', 'user'],
    });

    if (!trx) {
      throw new BadRequestException('Transaction not found');
    }

    let newStatus: PaymentStatus;

    switch (dto.status) {
      case 'success':
        newStatus = PaymentStatus.SUCCESS;
        break;
      case 'failed':
        newStatus = PaymentStatus.FAILED;
        break;
      case 'pending':
        newStatus = PaymentStatus.PENDING;
        break;
      default:
        throw new BadRequestException('Invalid status');
    }

    trx.paymentStatus = newStatus;

    await this.transactionRepo.save(trx);

    const data: any = {
      message: 'Callback processed successfully',
      transactionId: trx.id,
      status: trx.paymentStatus,
    };

    return new ResObjDto(data, HttpStatus.OK, 'Success');
  }
}
