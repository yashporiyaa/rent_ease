import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard.js';
import { ItemSizeService } from './item-size.service.js';
import { CreateItemSizeDto } from './dto/create-item-size.dto.js';
import { UpdateItemSizeDto } from './dto/update-item-size.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';

@Controller('item-sizes')
export class ItemSizeController {
  constructor(private readonly itemSizeService: ItemSizeService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateItemSizeDto) {
    return this.itemSizeService.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: AuthenticatedRequest) {
    return this.itemSizeService.getAll(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemSizeDto,
  ) {
    return this.itemSizeService.update(req.user.sub, id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.itemSizeService.remove(req.user.sub, id);
  }
}
