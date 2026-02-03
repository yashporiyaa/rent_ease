import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.userService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.userService.login(dto);
  }
}
