import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RentalService } from './rental.service.js';
import { CreateRentalDto } from './dto/create-rental.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { CalendarQueryDto } from './dto/calendar-query.dto.js';
import { CheckItemAvailabilityDto } from './dto/check-item-availability.dto.js';

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
  @Get('calendar')
  getCalendar(@Req() req: any, @Query() query: CalendarQueryDto) {
    return this.rentalService.getCalendarData(
      req.user.sub,
      query.start,
      query.end,
    );
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('check-availability')
  async checkAvailability(
    @Req() req: any,
    @Body() dto: CheckItemAvailabilityDto,
  ) {
    return await this.rentalService.checkItemAvailability(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    return await this.rentalService.getOne(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: CreateRentalDto) {
    return await this.rentalService.update(req.user.sub, id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return await this.rentalService.remove(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id/return')
  returnRental(@Req() req: any, @Param('id') id: string) {
    return this.rentalService.returnRental(req.user.sub, id);
  }
}
