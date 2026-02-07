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

  async updateUser(supabaseId: string, data: any) {
    try {
      const user = await this.prisma.user.update({
        where: { supabaseId },
        data,
      });

      return user;
    } catch (error) {
      console.log(error.message);
    }
  }

  async updateBusinessBySupabaseId(supabaseId: string, address: string) {
    const businessAddress = address;
    const user = await this.prisma.user.update({
      where: { supabaseId },
      data: {
        businessAddress,
      },
    });

    return user;
  }

  async findById(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }
}
