import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const supabaseId = req.user.sub;
    return await this.customerService.createCustomer(supabaseId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: any) {
    const supabaseId = req.user.sub;
    return await this.customerService.getAll(supabaseId);
  }
}
