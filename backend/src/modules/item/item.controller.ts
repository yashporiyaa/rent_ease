import { Body, Controller, Get, Post, Query, Req, UseGuards, Delete, Param, Patch, } from '@nestjs/common';
import { ItemService } from './item.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';

@Controller('items')
export class ItemController {
  constructor(private readonly ItemService: ItemService) { }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateItemDto) {
    const supabaseId = req.user.sub;
    return await this.ItemService.create(supabaseId, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    const supabaseId = req.user.sub;
    return await this.ItemService.getAll(supabaseId, query);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.ItemService.update(req.user.sub, id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ItemService.remove(req.user.sub, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('availability')
  getAvailability(
    @Req() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.ItemService.getAvailability(req.user.sub, startDate, endDate);
  }
}
