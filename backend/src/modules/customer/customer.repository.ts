import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";

@Injectable()
export class CustomerRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateCustomerDto) {
    return this.prisma.Customer.create({
      data: dto,
    });
  }
}
