import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';

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
}
