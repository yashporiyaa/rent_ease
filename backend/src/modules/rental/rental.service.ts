import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RentalRepository } from './rental.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { CheckItemAvailabilityDto } from './dto/check-item-availability.dto.js';
import { DeliveryQueryDto } from './dto/delivery-query.dto.js';

@Injectable()
export class RentalService {
  constructor(
    private readonly rentalRepository: RentalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(supabaseId: string, dto: CreateRentalDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.rentalRepository.assertItemsAvailable(user.id, dto);

    const appliedTaxRate =
      dto.taxPercent > 0 ? dto.taxPercent : (user.taxRate ?? 0);

    const { rental, invoice } =
      await this.rentalRepository.createRentalWithInvoice(
        user.id,
        dto,
        appliedTaxRate,
      );

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

  async update(supabaseId: string, rentalId: string, dto: CreateRentalDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingRental = await this.rentalRepository.findByIdAndUser(
      rentalId,
      user.id,
    );
    if (!existingRental) {
      throw new NotFoundException('Rental not found');
    }

    await this.rentalRepository.assertItemsAvailable(user.id, dto, rentalId);

    const appliedTaxRate =
      dto.taxPercent > 0 ? dto.taxPercent : (user.taxRate ?? 0);

    const rental = await this.rentalRepository.updateRentalWithInvoice(
      rentalId,
      user.id,
      dto,
      appliedTaxRate,
    );

    return {
      success: true,
      data: rental,
    };
  }

  async remove(supabaseId: string, rentalId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingRental = await this.rentalRepository.findByIdAndUser(
      rentalId,
      user.id,
    );
    if (!existingRental) {
      throw new NotFoundException('Rental not found');
    }

    await this.rentalRepository.deleteById(user.id, rentalId);

    return {
      success: true,
      message: 'Rental deleted successfully',
      data: { id: rentalId },
    };
  }

  async returnRental(supabaseId: string, rentalId: string) {
    //  Find user
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get rental
    const rental = await this.rentalRepository.findByIdAndUser(
      rentalId,
      user.id,
    );

    if (!rental) {
      throw new NotFoundException('Rental not found');
    }

    if (rental.status !== 'ACTIVE') {
      throw new BadRequestException('Rental already completed');
    }

    // Update rental
    return await this.rentalRepository.markAsReturned(rentalId);
  }

  async getOverdueRentals(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.rentalRepository.findOverdueByUser(user.id);
  }

  async getCalendarData(supabaseId: string, start: string, end: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) throw new NotFoundException('User not found');

    const rentals = await this.rentalRepository.findCalendarBookings(
      user.id,
      new Date(start),
      new Date(end),
    );

    const grouped: Record<string, { label: string; rentalId: string }[]> = {};

    for (const rental of rentals) {
      const dateKey = rental.startDate.toISOString().slice(0, 10);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push({
        label: rental.invoice?.invoiceNo ?? rental.id.slice(0, 8),
        rentalId: rental.id,
      });
    }

    const result = Object.entries(grouped).map(([date, bookings]) => {
      return {
        date,
        bookings,
        moreCount: bookings.length > 3 ? bookings.length - 3 : 0,
      };
    });

    return {
      success: true,
      message: 'Calendar data fetched successfully',
      data: result,
    };
  }

  async checkItemAvailability(
    supabaseId: string,
    dto: CheckItemAvailabilityDto,
  ) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const availability = await this.rentalRepository.checkItemAvailability(
      user.id,
      dto.itemId,
      dto.quantity,
      dto.fromAt,
      dto.toAt,
      dto.excludeRentalId,
    );

    return {
      success: true,
      data: availability,
    };
  }

  async getDeliveryList(supabaseId: string, query: DeliveryQueryDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deliveries = await this.rentalRepository.findDeliveryList(
      user.id,
      query,
    );

    return {
      success: true,
      data: deliveries,
    };
  }

  async updateDeliveryStatus(
    supabaseId: string,
    rentalItemId: string,
    status: 'picked' | 'pending',
  ) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rentalItem = await this.rentalRepository.findDeliveryItemById(
      user.id,
      rentalItemId,
    );
    if (!rentalItem) {
      throw new NotFoundException('Delivery item not found');
    }

    const updated = await this.rentalRepository.updateDeliveryStatus(
      rentalItemId,
      status,
    );

    return {
      success: true,
      data: updated,
    };
  }
}
