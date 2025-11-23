import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { ReportsService } from './providers/reports/reports.service';
import { ReqReportsDto } from './dto/req-reports.dto';

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
  async getSalesReport(@Query() reqParam: ReqReportsDto) {
    return this.reportsService.getSalesReport(reqParam);
  }
}
