import { Injectable } from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto.js";
import { UserRepository } from "../user/user.repository.js";
import { CustomerRepository } from "./customer.repository.js";

@Injectable()
export class CustomerService {
  constructor(
    private repo: CustomerRepository,
    private userRepo: UserRepository
  ) {}

  async createCustomer(dto: CreateCustomerDto) {
    const customer = await this.repo.create(dto);

    // Update onboarding step
    await this.userRepo.updateUser(dto.userId, {
      onboardingStep: 3,
    });

    return customer;
  }
}
