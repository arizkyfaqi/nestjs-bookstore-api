import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { ReportsService } from './providers/reports/reports.service';

@Controller('admin/reports')
@ApiTags('Reports')
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN)
  async getSalesReport() {
    return this.reportsService.getSalesReport();
  }
}
