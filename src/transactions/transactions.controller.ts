import {
  Controller,
  Post,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './providers/transactions.service';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { CheckoutResponseDto } from './dto/checkout-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { ReqOrdersDto } from './dto/req-orders.dto';

@ApiTags('Transactions')
@ApiBearerAuth('access-token')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Checkout dari cart',
    description:
      'Membuat transaksi baru dari item yang ada di cart. Endpoint ini akan memvalidasi stok, mengurangi stok, membuat transaksi, dan menghapus item dari cart. ' +
      'Transaksi dibuat dengan status PENDING dan menunggu pembayaran.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Checkout berhasil. Kembalian berisi id transaksi, total amount, status pembayaran (PENDING), dan detail item yang dibeli.',
    type: CheckoutResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cart kosong atau stok buku tidak cukup',
  })
  async checkout(@CurrentUser() user: TokenPayload) {
    return await this.transactionsService.checkout(user.userId);
  }

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan semua order (transaksi) user',
    description:
      'Mengambil semua transaksi/order milik user yang sedang login. Diurutkan dari transaksi terbaru. ' +
      'Setiap order berisi detail item buku yang dibeli beserta harga dan quantity.',
  })
  @ApiResponse({
    status: 200,
    description: 'List order user berhasil diambil',
    type: [OrderResponseDto],
  })
  async getOrders(
    @CurrentUser() user: TokenPayload,
    @Query() reqParam: ReqOrdersDto,
  ) {
    return this.transactionsService.findByUser(user.userId, reqParam);
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan detail order spesifik',
    description:
      'Mengambil detail transaksi/order berdasarkan order ID. Hanya owner dari order atau admin yang bisa akses endpoint ini. ' +
      'Response berisi detail lengkap order termasuk item-item dan informasi pembayaran.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail order berhasil diambil',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order tidak ditemukan',
  })
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
