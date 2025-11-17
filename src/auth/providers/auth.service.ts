import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/users/providers/user.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/shared/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private hashingProvider: HashingProvider,
  ) {}

  private sessionKey(userId: string) {
    return `session:${userId}`;
  }

  async register(registerDto: RegisterDto) {
    return await this.userService.createUser(registerDto);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);

    let isValid: boolean = false;

    try {
      isValid = await this.hashingProvider.comparePassword(
        password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare password',
      });
    }

    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const { password: pw, ...rest } = user as any;

    return rest;
  }

  async login(user: any) {
    const jti = uuidv4();
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti,
    };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.jwtService.decode(token) ? 3600 : 3600;

    await this.redisService.set(this.sessionKey(user.id), jti, expiresIn);

    return { accessToken: token, expiresIn };
  }

  async logout(userId: string) {
    await this.redisService.del(this.sessionKey(userId));
  }
  async checkSession(userId: string, jti: string) {
    const current = await this.redisService.get(this.sessionKey(userId));
    return current && current === jti;
  }
}
