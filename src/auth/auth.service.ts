import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, password: hashedPassword });
    const tokens = await this.signTokens(user.id, user.email);

    return { user: this.usersService.sanitize(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.signTokens(user.id, user.email);
    return { user: this.usersService.sanitize(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'change_me_refresh_secret')
      });
      const user = await this.usersService.findById(payload.sub);
      const tokens = await this.signTokens(user.id, user.email);
      return { user: this.usersService.sanitize(user), ...tokens };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async signTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'change_me_access_secret'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m')
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'change_me_refresh_secret'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      })
    ]);

    return { accessToken, refreshToken };
  }
}
