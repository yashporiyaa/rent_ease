import { Injectable, NotFoundException } from '@nestjs/common';
import { RentalRepository } from './rental.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';

@Injectable()
export class RentalService {
  constructor(
    private readonly rentalRepository: RentalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(supabaseId: string, dto: CreateRentalDto) {
    // 1️Calculate total amount
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }
    const userId = user.id;

    // 2️Create rental (DB logic delegated)
    const rental = await this.rentalRepository.createRental(
      userId,
      dto,
      totalAmount,
    );

    // 3️Finish onboarding
    await this.userRepository.updateUser(supabaseId, {
      onboardingDone: true,
      onboardingStep: 4,
    });

    return rental;
  }
}
