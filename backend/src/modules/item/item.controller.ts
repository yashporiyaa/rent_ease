import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';

@Controller('items')
export class ItemController {
  constructor(private readonly ItemService: ItemService) { }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateItemDto) {
    const supabaseId = req.user.sub;
    return await this.ItemService.create(supabaseId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: any) {
    const supabaseId = req.user.sub;
    return await this.ItemService.getAll(supabaseId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('availability')
  getAvailability(
    @Req() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ItemService.getAvailability(req.user.sub, startDate, endDate);
  }
}
