import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from '../user/user.repository.js';
import { ItemCategoryRepository } from './item-category.repository.js';
import { CreateItemCategoryDto } from './dto/create-item-category.dto.js';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto.js';

@Injectable()
export class ItemCategoryService {
  constructor(
    private readonly itemCategoryRepository: ItemCategoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(supabaseId: string, dto: CreateItemCategoryDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const category = await this.itemCategoryRepository.create({
        userId: user.id,
        name: dto.name.trim(),
        imageUrl: dto.imageUrl,
      });

      return {
        message: 'Item category created successfully',
        data: category,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const categories = await this.itemCategoryRepository.findByUserId(user.id);

    return {
      data: categories,
    };
  }

  async update(supabaseId: string, id: string, dto: UpdateItemCategoryDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.itemCategoryRepository.findByIdAndUserId(
      id,
      user.id,
    );
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    try {
      const category = await this.itemCategoryRepository.updateById(id, {
        name: dto.name?.trim(),
        imageUrl: dto.imageUrl,
      });

      return {
        message: 'Item category updated successfully',
        data: category,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async remove(supabaseId: string, id: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.itemCategoryRepository.findByIdAndUserId(
      id,
      user.id,
    );
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const linkedItems = await this.itemCategoryRepository.countItemsByCategoryId(id);
    if (linkedItems > 0) {
      throw new ConflictException(
        'Cannot delete category while items are assigned to it',
      );
    }

    await this.itemCategoryRepository.removeById(id);

    return {
      message: 'Item category deleted successfully',
      data: { id },
    };
  }
}
