import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { CreateUserDto, LoginDto } from './dto/create-user.dto.js';
import { supabase } from '../../lib/supabase.js';

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
      onboardingDone: user.data.onboardingDone,
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
    };
  }

  async updateBusiness(data: any) {
    return await this.userRepository.updateUser(data.userId, {
      onboardingStep: 2,
    });
  }

  async completeOnboarding(userId: string) {
    return await this.userRepository.updateUser(userId, {
      onboardingDone: true,
    });
  }

  async getUser(userId: string) {
    return await this.userRepository.findById(userId);
  }
}
