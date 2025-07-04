import { Injectable, BadRequestException, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../db/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (userExists) throw new BadRequestException('Email đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        displayName: dto.displayName,
        status: 'Active',
        role: 'User',
        email: dto.email,
        password: hashed,
        avatar: dto.avatar,
      },
    });

    return {
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
    });

    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Sai mật khẩu');
    if (user.status == "Banned") throw new BadRequestException('Tài khoản đã bị khóa!!!');

    const accessToken = await this.signAccessToken(user.id, user.role);
    const refreshToken = await this.signRefreshToken(user.id, user.role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName,
        role: user.role,
        frameUrl: user.frameUrl,
        bgrUrl: user.bgrUrl,
      },
    };
  }

  async signAccessToken(userId: string, role: UserRole): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, role },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    );
  }

  async signRefreshToken(userId: string, role: UserRole): Promise<string> {
    return this.jwt.signAsync(
      { userId, role },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );
  }

  async refresh(refreshToken: string) {
    const payload: { userId: string; role: UserRole } =
      await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

    const { userId, role } = payload;

    const newAccessToken = await this.signAccessToken(userId, role);
    return { accessToken: newAccessToken };
  }

  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'Đăng xuất thành công' };
  }
}
