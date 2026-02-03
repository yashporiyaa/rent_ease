import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      return await this.userRepository.createUser(createUserDto);
    } catch (error) {
      // handle unique email error
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  getUsers() {
    return this.userRepository.findAllUsers();
  }
}
