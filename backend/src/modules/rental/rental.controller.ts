import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RentalService } from './rental.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('rentals')
export class RentalController {
  constructor(private readonly service: RentalService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateRentalDto) {
    return await this.service.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: any) {
    return await this.service.getAll(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    return await this.service.getOne(req.user.sub, id);
  }
}
