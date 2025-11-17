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
import { ResObjDto } from 'src/utils/dto/res-obj.dto';
import { ResMsgDto } from 'src/utils/dto/res-msg.dto';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth('access-token')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto): Promise<ResObjDto<any>> {
    const user = await this.authService.register(dto);
    return new ResObjDto(user, HttpStatus.OK, 'Success');
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto): Promise<ResObjDto<any>> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      return new ResObjDto(
        dto,
        HttpStatus.BAD_REQUEST,
        'Invalid email or password!',
      );
    }
    const token = await this.authService.login(user);

    return new ResObjDto(token, HttpStatus.OK, 'Success');
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.ADMIN, RoleType.CUSTOMER)
  async logout(@CurrentUser() user: TokenPayload): Promise<ResMsgDto> {
    const userId = user.userId;
    await this.authService.logout(userId);
    return new ResMsgDto(HttpStatus.OK, 'Success');
  }
}
