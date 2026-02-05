import { Body, Controller, Post } from "@nestjs/common";
import { CustomerService } from "./customer.service.js";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";


@Controller("customers")
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.createCustomer(dto);
  }
}
