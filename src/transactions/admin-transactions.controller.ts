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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/shared/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { AdminTransactionsService } from './providers/admin-transactions.service';
import { AdminAllTransactionsResponseDto } from './dto/admin-all-transactions-response.dto';
import { AdminUserTransactionsResponseDto } from './dto/admin-user-transactions-response.dto';
import { ReqOrdersDto } from './dto/req-orders.dto';
import { CacheKey } from 'src/shared/decorators/cache.decorator';
import { HttpCacheInterceptor } from 'src/common/interceptors/redis-cache/http-cache.interceptor';
import { GET_ADMIN_TRANSACTIONS_CACHE } from 'src/utils/constants/cache.constant';
import { GET_ADMIN_TRANSACTIONS_DETAIL_CACHE } from 'src/utils/constants/cache.constant';

@ApiTags('Admin Transactions')
@ApiBearerAuth('access-token')
@Controller('admin/transactions')
export class AdminTransactionsController {
  constructor(
    private readonly adminTransactionsService: AdminTransactionsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan semua transaksi di sistem',
    description:
      'Admin endpoint untuk melihat semua transaksi/order dari semua user. ' +
      'Mencakup informasi user, detail item, dan data buku untuk setiap transaksi. Diurutkan dari transaksi terbaru.',
  })
  @ApiResponse({
    status: 200,
    description: 'List semua transaksi berhasil diambil',
    type: AdminAllTransactionsResponseDto,
  })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_ADMIN_TRANSACTIONS_CACHE)
  getAllTransactions(@Query() reqParam: ReqOrdersDto) {
    return this.adminTransactionsService.getAllTransactions(reqParam);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan semua transaksi user spesifik',
    description:
      'Admin endpoint untuk melihat semua transaksi/order milik user tertentu berdasarkan userId. ' +
      'Response berisi informasi user, total transaksi, dan list semua order user tersebut.',
  })
  @ApiResponse({
    status: 200,
    description: 'List transaksi user berhasil diambil',
    type: AdminUserTransactionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User tidak ditemukan',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_ADMIN_TRANSACTIONS_DETAIL_CACHE)
  getUserTransactions(@Param('userId') userId: string) {
    return this.adminTransactionsService.getUserTransactions(userId);
  }
}
