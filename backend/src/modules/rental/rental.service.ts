import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RentalRepository } from './rental.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { CheckItemAvailabilityDto } from './dto/check-item-availability.dto.js';
import { DeliveryQueryDto } from './dto/delivery-query.dto.js';
import { ReturnQueryDto } from './dto/return-query.dto.js';
import { RentalListQueryDto } from './dto/rental-list-query.dto.js';
import {
  buildPaginationMeta,
  resolvePagination,
} from '../../common/utils/pagination.util.js';

@Injectable()
export class RentalService {
  constructor(
    private readonly rentalRepository: RentalRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private parseDateOrThrow(value: string, field: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${field}`);
    }
    return date;
  }

  private ensureRange(fromAt: string, toAt: string, context: string) {
    const fromDate = this.parseDateOrThrow(fromAt, `${context} fromAt`);
    const toDate = this.parseDateOrThrow(toAt, `${context} toAt`);

    if (toDate <= fromDate) {
      throw new BadRequestException(
        `${context} toAt must be later than fromAt`,
      );
    }
  }

  private validateRentalTimeline(dto: CreateRentalDto) {
    this.parseDateOrThrow(dto.bookingAt, 'bookingAt');

    if (!dto.lineItems?.length) {
      throw new BadRequestException(
        'At least one rental line item is required',
      );
    }

    dto.lineItems.forEach((item, index) => {
      this.ensureRange(item.fromAt, item.toAt, `lineItems[${index}]`);
    });
  }

  private ensureUserCanCreateRental(user: {
    subscriptionStatus: string;
    trialEndsAt: Date;
  }) {
    if (user.subscriptionStatus === 'ACTIVE') {
      return;
    }

    if (
      user.subscriptionStatus === 'TRIAL' &&
      user.trialEndsAt.getTime() > Date.now()
    ) {
      return;
    }

    throw new ForbiddenException(
      'Your free trial has ended. Please activate a subscription to create rentals.',
    );
  }

  async create(supabaseId: string, dto: CreateRentalDto) {
    this.validateRentalTimeline(dto);

    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.ensureUserCanCreateRental(user);

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

  async getAll(supabaseId: string, query: RentalListQueryDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pagination = resolvePagination(query);
    const [rentals, totalItems] =
      await this.rentalRepository.findByUserIdPaginated(
        user.id,
        pagination.skip,
        pagination.take,
      );

    return {
      success: true,
      data: rentals,
      meta: buildPaginationMeta(pagination, totalItems),
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
    this.validateRentalTimeline(dto);

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

    const grouped: Record<
      string,
      { label: string; rentalId: string; isDelivered: boolean }[]
    > = {};

    for (const rental of rentals) {
      const dateKey = rental.startDate.toISOString().slice(0, 10);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push({
        label: rental.invoice?.invoiceNo ?? rental.id.slice(0, 8),
        rentalId: rental.id,
        isDelivered:
          rental.rentalItems.length > 0 &&
          rental.rentalItems.every((item) => item.deliveryStatus === 'PICKED'),
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
    this.ensureRange(dto.fromAt, dto.toAt, 'availability');

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
      dto.sizeId,
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

    if (rentalItem.deliveryStatus === 'PICKED' && status === 'pending') {
      throw new BadRequestException(
        'Cannot set status back to pending after item is picked',
      );
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

  async getReturnList(supabaseId: string, query: ReturnQueryDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const returns = await this.rentalRepository.findReturnList(user.id, query);

    return {
      success: true,
      data: returns,
    };
  }

  async updateReturnStatus(supabaseId: string, rentalItemId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rentalItem = await this.rentalRepository.findDeliveryItemById(
      user.id,
      rentalItemId,
    );
    if (!rentalItem) {
      throw new NotFoundException('Return item not found');
    }

    if (rentalItem.deliveryStatus !== 'PICKED') {
      throw new BadRequestException(
        'Item must be picked in Delivery before marking returned',
      );
    }

    if (rentalItem.status === 'RETURNED') {
      throw new BadRequestException('Item is already returned');
    }

    const updated =
      await this.rentalRepository.updateReturnStatus(rentalItemId);

    return {
      success: true,
      data: updated,
    };
  }
}
