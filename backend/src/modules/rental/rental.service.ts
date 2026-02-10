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
    // Calculate total
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create rental + invoice together
    const { rental, invoice } =
      await this.rentalRepository.createRentalWithInvoice(
        user.id,
        dto,
        totalAmount,
      );

    //  Finish onboarding (first rental)
    if (!user.onboardingDone) {
      await this.userRepository.updateUser(supabaseId, {
        onboardingDone: true,
        onboardingStep: 4,
      });
    }

    return {
      success: true,
      data: {
        rental,
        invoice,
      },
    };
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rentals = await this.rentalRepository.findByUserId(user.id);

    return {
      success: true,
      data: rentals,
    };
  }

  async getOne(supabaseId: string, rentalId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rental = await this.rentalRepository.findById(user.id, rentalId);

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    return {
      success: true,
      data: rental,
    };
  }
}
