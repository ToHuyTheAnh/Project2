import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { Response } from 'express';
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
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
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
