import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemRepository } from './item.repository.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { ItemCategoryRepository } from '../item-category/item-category.repository.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { ItemSizeRepository } from '../item-size/item-size.repository.js';

@Injectable()
export class ItemService {
  constructor(
    private itemRepository: ItemRepository,
    private userRepository: UserRepository,
    private itemCategoryRepository: ItemCategoryRepository,
    private itemSizeRepository: ItemSizeRepository,
  ) {}

  async create(supabaseId: string, dto: CreateItemDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
      });
    }

    const category = await this.itemCategoryRepository.findByIdAndUserId(
      dto.categoryId,
      user.id,
    );
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const size = await this.itemSizeRepository.findByIdAndUserId(
      dto.sizeId,
      user.id,
    );
    if (!size) {
      throw new NotFoundException('Size not found');
    }

    const userId = user.id;
    const item = await this.itemRepository.create({
      userId,
      shortName: dto.shortName,
      fullName: dto.fullName,
      description: dto.description,
      categoryId: category.id,
      category: category.name,
      sizeId: size.id,
      size: size.name,
      price: dto.price,
      entryDate: new Date(dto.entryDate),
      quantity: dto.quantity,
      images: dto.images ?? [],
      stock: dto.quantity,
    });

    return item;
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = await this.itemRepository.findByUserId(user.id);

    return {
      success: true,
      data: items,
    };
  }

  async getAvailability(
    supabaseId: string,
    startDate: string,
    endDate: string,
  ) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = await this.itemRepository.getAvailabilityByUserId(
      user.id,
      startDate,
      endDate,
    );

    return {
      success: true,
      data: result,
    };
  }

  async update(supabaseId: string, id: string, dto: UpdateItemDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingItem = await this.itemRepository.findByIdAndUserId(id, user.id);
    if (!existingItem) {
      throw new NotFoundException('Item not found');
    }

    let categoryId = existingItem.categoryId ?? undefined;
    let categoryName = existingItem.category;
    let sizeId = existingItem.sizeId ?? undefined;
    let sizeName = existingItem.size ?? undefined;

    if (dto.categoryId) {
      const category = await this.itemCategoryRepository.findByIdAndUserId(
        dto.categoryId,
        user.id,
      );
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      categoryId = category.id;
      categoryName = category.name;
    }

    if (dto.sizeId) {
      const size = await this.itemSizeRepository.findByIdAndUserId(
        dto.sizeId,
        user.id,
      );
      if (!size) {
        throw new NotFoundException('Size not found');
      }

      sizeId = size.id;
      sizeName = size.name;
    }

    const item = await this.itemRepository.updateById(id, {
      shortName: dto.shortName,
      fullName: dto.fullName,
      description: dto.description,
      price: dto.price,
      categoryId,
      category: categoryName,
      sizeId,
      size: sizeName,
      entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
      quantity: dto.quantity,
      images: dto.images,
      stock: dto.quantity,
    });

    return {
      message: 'Item updated successfully',
      data: item,
    };
  }

  async remove(supabaseId: string, id: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingItem = await this.itemRepository.findByIdAndUserId(id, user.id);
    if (!existingItem) {
      throw new NotFoundException('Item not found');
    }

    const linkedRentalItems = await this.itemRepository.countRentalItems(id);
    if (linkedRentalItems > 0) {
      throw new ConflictException(
        'Cannot delete item because it is already used in rentals',
      );
    }

    await this.itemRepository.deleteById(id);

    return {
      message: 'Item deleted successfully',
      data: { id },
    };
  }
}
