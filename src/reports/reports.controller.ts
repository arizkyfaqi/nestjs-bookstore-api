import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/shared/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { ReportsService } from './providers/reports/reports.service';
import { ReqReportsDto } from './dto/req-reports.dto';
import { CacheKey } from 'src/shared/decorators/cache.decorator';
import { HttpCacheInterceptor } from 'src/common/interceptors/redis-cache/http-cache.interceptor';
import { GET_REPORT_SELES_CACHE } from 'src/utils/constants/cache.constant';

@Controller('admin/reports')
@ApiTags('Reports')
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Admin report',
    description:
      'Menampilkan report penjualan, {bookId, title, stockRemaining, quantitySold, totalRevenue}',
  })
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_REPORT_SELES_CACHE)
  async getSalesReport(@Query() reqParam: ReqReportsDto) {
    return this.reportsService.getSalesReport(reqParam);
  }
}
