import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from '../user/user.repository.js';
import { ItemSizeRepository } from './item-size.repository.js';
import { CreateItemSizeDto } from './dto/create-item-size.dto.js';
import { UpdateItemSizeDto } from './dto/update-item-size.dto.js';

@Injectable()
export class ItemSizeService {
  constructor(
    private readonly itemSizeRepository: ItemSizeRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async create(supabaseId: string, dto: CreateItemSizeDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const size = await this.itemSizeRepository.create({
        userId: user.id,
        name: dto.name.trim(),
      });

      return {
        message: 'Item size created successfully',
        data: size,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Size name already exists');
      }
      throw error;
    }
  }

  async getAll(supabaseId: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sizes = await this.itemSizeRepository.findByUserId(user.id);

    return {
      data: sizes,
    };
  }

  async update(supabaseId: string, id: string, dto: UpdateItemSizeDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.itemSizeRepository.findByIdAndUserId(id, user.id);
    if (!existing) {
      throw new NotFoundException('Size not found');
    }

    try {
      const size = await this.itemSizeRepository.updateById(id, {
        name: dto.name?.trim(),
      });

      await this.itemSizeRepository.updateItemSizeLabels(id, size.name);

      return {
        message: 'Item size updated successfully',
        data: size,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Size name already exists');
      }
      throw error;
    }
  }

  async remove(supabaseId: string, id: string) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.itemSizeRepository.findByIdAndUserId(id, user.id);
    if (!existing) {
      throw new NotFoundException('Size not found');
    }

    const linkedItems = await this.itemSizeRepository.countItemsBySizeId(id);
    if (linkedItems > 0) {
      throw new ConflictException(
        'Cannot delete size while items are assigned to it',
      );
    }

    await this.itemSizeRepository.removeById(id);

    return {
      message: 'Item size deleted successfully',
      data: { id },
    };
  }

}
