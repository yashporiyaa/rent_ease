import { Body, Controller, Get, Post, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

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

  @UseGuards(SupabaseAuthGuard)
  @Get('by-phone/:phone')
  async getByPhone(@Req() req: any, @Param('phone') phone: string) {
    return this.customerService.findByPhone(req.user.sub, phone);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(req.user.sub, id, dto);
  }
}
