import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    supabaseId: string;
    companyName: string;
    phone: string;
    email: string;
    businessType: string;
  }) {
    const user = await this.prisma.user.create({ data });

    return {
      message: 'User created successfully',
      data: user,
    };
  }

  // findBySupabaseId(supabaseUserId: string) {
  //   return this.prisma.user.findUnique({
  //     where: { supabaseId },
  //   });
  // }
}
