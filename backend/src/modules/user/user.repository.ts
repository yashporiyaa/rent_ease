import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  create(data: {
    supabaseId: string;
    companyName: string;
    phone: string;
    email: string;
    businessType: string;
  }) {
    return this.prisma.user.create({ data });
  }

  // findBySupabaseId(supabaseUserId: string) {
  //   return this.prisma.user.findUnique({
  //     where: { supabaseId },
  //   });
  // }
}
