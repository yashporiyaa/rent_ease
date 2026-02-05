import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    return await this.userService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }

  @Patch('onboarding/business')
  async updateBusiness(@Body() body: any) {
    return await this.userService.updateBusiness(body);
  }

  @Patch('onboarding/complete')
  async completeOnboarding(@Body('userId') userId: string) {
    return await this.userService.completeOnboarding(userId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    console.log(req.user);
    return this.userService.getUser(req.user.id);
  }
}
