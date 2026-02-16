import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { UpdateTaxDto } from './dto/update-tax.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Res({ passthrough: true }) res, @Body() dto: CreateUserDto) {
    const { accessToken, user } = await this.userService.signup(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return user;
  }

  @Post('login')
  async login(@Res({ passthrough: true }) res, @Body() dto) {
    const { accessToken, user } = await this.userService.login(dto);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true in production (https)
    });

    return user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res) {
    res.clearCookie('accessToken');
    return { success: true };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.userService.forgotPassword(email);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('onboarding/business')
  async updateBusiness(@Req() req: any, @Body() body: any) {
    const supabaseId = req.user.sub;

    return this.userService.updateBusiness(supabaseId, body.address);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch('onboarding/complete')
  async completeOnboarding(@Req() req: any, @Body('userId') userId: string) {
    return await this.userService.completeOnboarding(userId);
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
