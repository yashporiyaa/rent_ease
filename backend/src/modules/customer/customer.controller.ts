import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const supabaseId = req.user.sub;
    console.log(req.user)
    return await this.service.createCustomer(supabaseId, dto);
  }
}
