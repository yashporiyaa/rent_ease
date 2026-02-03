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
  constructor(private readonly userRepository: UserRepository) { }

  async signup(createUserDto: CreateUserDto) {
    const { email, password, companyName, phone, businessType } =
      createUserDto;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      if (error.message.includes('already')) {
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException(error.message);
    }

    if (!data?.user) {
      throw new InternalServerErrorException(
        'Supabase user creation failed',
      );
    }

    try {
      return await this.userRepository.create({
        supabaseId: data.user.id,
        email,
        companyName,
        phone,
        businessType,
      });
    } catch (dbError) {
      // Optional cleanup (advanced)
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new InternalServerErrorException(
        'User created in auth but failed in database',
      );
    }
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
      userId: data.user.id,
    };
  }
}
