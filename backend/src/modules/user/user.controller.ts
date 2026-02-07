import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

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
}
