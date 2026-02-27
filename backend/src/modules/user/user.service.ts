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

    const supabaseUser = data.user;
    const userEmail = supabaseUser.email ?? dto.email;
    let appUser = await this.userRepository.findById(supabaseUser.id);

    if (!appUser) {
      const existingByEmail = await this.userRepository.findByEmail(userEmail);

      if (existingByEmail) {
        appUser = await this.userRepository.linkSupabaseIdByEmail(
          userEmail,
          supabaseUser.id,
        );
      } else {
        const metadata =
          typeof supabaseUser.user_metadata === 'object' &&
          supabaseUser.user_metadata !== null
            ? (supabaseUser.user_metadata as Record<string, unknown>)
            : {};

        const companyName =
          typeof metadata.companyName === 'string' &&
          metadata.companyName.trim().length > 0
            ? metadata.companyName.trim()
            : userEmail.split('@')[0];
        const phone =
          typeof metadata.phone === 'string' && metadata.phone.trim().length > 0
            ? metadata.phone.trim()
            : '0000000000';
        const businessType =
          typeof metadata.businessType === 'string' &&
          metadata.businessType.trim().length > 0
            ? metadata.businessType.trim()
            : 'General';

        await this.userRepository.create({
          supabaseId: supabaseUser.id,
          email: userEmail,
          companyName,
          phone,
          businessType,
          onboardingDone: true,
        });
        appUser = await this.userRepository.findById(supabaseUser.id);
      }
    }

    if (!appUser) {
      throw new UnauthorizedException('User profile not found');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: appUser,
    };
  }

  async forgotPassword(email: string) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${frontendUrl}/auth/reset-password`,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'If an account exists, a password reset email has been sent',
    };
  }

  async getUser(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    return user;
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

  async getUpcomingReturns(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const upcomingReturns = await this.userRepository.getUpcomingReturns(
      user.id,
    );

    return {
      success: true,
      data: upcomingReturns,
    };
  }

  async getRecentActivities(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activities = await this.userRepository.getRecentActivities(user.id);

    return {
      success: true,
      data: activities,
    };
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
