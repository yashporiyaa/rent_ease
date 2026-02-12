import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RentalService } from './rental.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('rentals')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateRentalDto) {
    return await this.rentalService.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: any) {
    return await this.rentalService.getAll(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('overdue')
  async getOverdue(@Req() req: any) {
    return await this.rentalService.getOverdueRentals(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    return await this.rentalService.getOne(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/return')
  returnRental(@Req() req: any, @Param('id') id: string) {
    return this.rentalService.returnRental(req.user.sub, id);
  }
}
