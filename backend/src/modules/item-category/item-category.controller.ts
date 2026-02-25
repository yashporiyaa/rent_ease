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
import { ItemCategoryService } from './item-category.service.js';
import { CreateItemCategoryDto } from './dto/create-item-category.dto.js';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto.js';
import type { AuthenticatedRequest } from 'src/types/authenticated-request.js';

@Controller('item-categories')
export class ItemCategoryController {
  constructor(private readonly itemCategoryService: ItemCategoryService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateItemCategoryDto) {
    return this.itemCategoryService.create(req.user.sub, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get()
  async getAll(@Req() req: AuthenticatedRequest) {
    return this.itemCategoryService.getAll(req.user.sub);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateItemCategoryDto,
  ) {
    return this.itemCategoryService.update(req.user.sub, id, dto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.itemCategoryService.remove(req.user.sub, id);
  }
}
