import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  findAllUsers() {
    return this.prisma.user.findMany();
  }
}
