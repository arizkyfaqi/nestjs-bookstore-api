import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './providers/auth.service';
import { RegisterDto } from './dto/register.dto';
import { Auth } from './decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from './decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { success: true, data: user };
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      return { success: false, message: 'Invalid email or password!' };
    }
    const token = await this.authService.login(user);
    return { success: true, data: token };
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN, RoleType.CUSTOMER)
  async logout(@CurrentUser() user: TokenPayload) {
    const userId = user.userId;
    await this.authService.logout(userId);
    return { success: true };
  }
}
