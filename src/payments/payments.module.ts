import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments/payments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from 'src/transactions/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
