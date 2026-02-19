import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';
import { supabase } from '../../lib/supabase.js';
import { UpdateTaxDto } from './dto/update-tax.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, companyName, phone, businessType } = createUserDto;

    // STEP 1 — Create Supabase Auth User
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      throw new ConflictException(error.message);
    }

    if (!data?.user) {
      throw new InternalServerErrorException('Auth user creation failed');
    }

    // STEP 2 — Create Prisma User
    const user = await this.userRepository.create({
      supabaseId: data.user.id,
      email,
      companyName,
      phone,
      businessType,
      onboardingDone: true,
    });

    // STEP 3 — 🔥 Auto Login User
    const loginRes = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginRes.error) {
      throw new InternalServerErrorException('Auto login failed');
    }

    return {
      user,
      session: loginRes.data.session,
      accessToken: loginRes.data.session.access_token,
      onboardingDone: true,
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    };
  }

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'If an account exists, a password reset email has been sent',
    };
  }

  async getUser(supabaseId: string) {
    return await this.userRepository.findById(supabaseId);
  }

  async getDashboardData(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.getDashboardStats(user.id);
  }

  async getRevenueAnalytics(supabaseId: string, range: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.getRevenueAnalytics(user.id, range);
  }

  async updateTax(supabaseId: string, dto: UpdateTaxDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.updateUserByInternalId(user.id, {
      taxRate: dto.taxRate,
    });

    return {
      success: true,
      message: 'Tax rate updated successfully',
      data: {
        taxRate: updated.taxRate,
      },
    };
  }

  async updateProfile(supabaseId: string, dto: UpdateProfileDto) {
    const updated = await this.userRepository.updateProfile(supabaseId, dto);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  }
}
