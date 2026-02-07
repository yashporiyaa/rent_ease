import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateRentalDto } from "./dto/create-rental.dto.js";

@Injectable()
export class RentalRepository {
  constructor(private prisma: PrismaService) {}

  async createRental(userId: string, dto: CreateRentalDto, totalAmount: number) {
    return this.prisma.rental.create({
      data: {
        userId,
        customerId: dto.customerId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        totalAmount,
        rentalItems: {
          create: dto.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }
}
