import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RentalService } from './rental.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('rentals')
export class RentalController {
  constructor(private readonly service: RentalService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreateRentalDto) {
    return this.service.create(req.user.sub, dto);
  }
}
