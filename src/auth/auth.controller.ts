import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedRequest } from 'src/common/interface/authenticated-request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Req() req: AuthenticatedRequest) {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    return await this.authService.refresh(refreshToken);
  }
}
