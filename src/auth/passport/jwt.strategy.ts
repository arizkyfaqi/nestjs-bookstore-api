import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../providers/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { UserService } from 'src/users/providers/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private config: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // payload contains sub (userId) and jti
    const userId = payload.sub;
    const jti = payload.jti;
    const ok = await this.authService.checkSession(userId, jti);
    if (!ok) {
      throw new UnauthorizedException('Session invalid or expired');
    }

    const user = await this.userService.findOneById(userId);

    if (!user) {
      new UnauthorizedException();
    }

    // return object attached to request.user
    return { userId, email: payload.email, role: payload.role };
    // return user;
  }
}
