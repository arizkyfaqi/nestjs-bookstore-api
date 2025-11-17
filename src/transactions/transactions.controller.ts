import {
  Controller,
  Post,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './providers/transactions.service';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  async checkout(@CurrentUser() user: TokenPayload) {
    return await this.transactionsService.checkout(user.userId);
  }

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  async getOrders(@CurrentUser() user: TokenPayload) {
    return this.transactionsService.findByUser(user.userId);
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  async getOrder(
    @CurrentUser() user: TokenPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const order = await this.transactionsService.findOneForUser(
      id,
      user.userId,
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
