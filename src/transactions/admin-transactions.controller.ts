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
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { AdminTransactionsService } from './providers/admin-transactions.service';

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
  getAllTransactions() {
    return this.adminTransactionsService.getAllTransactions();
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  getUserTransactions(@Param('userId') userId: string) {
    return this.adminTransactionsService.getUserTransactions(userId);
  }
}
