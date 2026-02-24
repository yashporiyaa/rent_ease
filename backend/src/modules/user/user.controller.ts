import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { UpdateTaxDto } from './dto/update-tax.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { CookieOptions } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getAccessTokenCookieOptions(): CookieOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const secure =
      process.env.COOKIE_SECURE === 'true' ||
      (process.env.COOKIE_SECURE !== 'false' && isProduction);

    const envSameSite = process.env.COOKIE_SAME_SITE as
      | 'lax'
      | 'strict'
      | 'none'
      | undefined;
    const sameSite = envSameSite ?? (secure ? 'none' : 'lax');

    return {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    };
  }

  @Post('signup')
  async signup(@Res({ passthrough: true }) res, @Body() dto: CreateUserDto) {
    const { accessToken, user } = await this.userService.signup(dto);

    res.cookie('accessToken', accessToken, this.getAccessTokenCookieOptions());

    return user;
  }

  @Post('login')
  async login(@Res({ passthrough: true }) res, @Body() dto: LoginDto) {
    const { accessToken, user } = await this.userService.login(dto);
    res.cookie('accessToken', accessToken, this.getAccessTokenCookieOptions());

    return user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('accessToken', this.getAccessTokenCookieOptions());
    return { success: true };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.userService.forgotPassword(email);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    const supabaseId = req.user.sub;
    return this.userService.getUser(supabaseId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('dashboard')
  async getDashboardStats(@Req() req: any) {
    return this.userService.getDashboardData(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('revenue-analytics')
  async getRevenue(@Req() req: any, @Query('range') range: string) {
    return this.userService.getRevenueAnalytics(req.user.sub, range ?? '30d');
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('settings/tax')
  updateTax(@Req() req: any, @Body() dto: UpdateTaxDto) {
    return this.userService.updateTax(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }
}
