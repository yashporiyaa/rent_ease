import { Body, Controller, Get, Post, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCustomerDto) {
    const supabaseId = req.user.sub;
    return await this.customerService.createCustomer(supabaseId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    const supabaseId = req.user.sub;
    return await this.customerService.getAll(supabaseId, query);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('by-phone/:phone')
  async getByPhone(@Req() req: AuthenticatedRequest, @Param('phone') phone: string) {
    return this.customerService.findByPhone(req.user.sub, phone);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.updateCustomer(req.user.sub, id, dto);
  }
}
