import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from './item,repository.js';
import { UserRepository } from '../user/user.repository.js';
import { CreateItemDto } from './dto/create-item.dto.js';

@Injectable()
export class ItemService {
  constructor(
    private itemRepository: ItemRepository,
    private userRepository: UserRepository
  ) { }

  async create(supabaseId: string, dto: CreateItemDto) {
    const user = await this.userRepository.findById(supabaseId);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found'
      });
    }
    const userId = user.id;
    const item = await this.itemRepository.create({
      userId,
      ...dto,
    });

    //  MOVE ONBOARDING TO STEP 4
    await this.userRepository.updateUser(supabaseId, {
      onboardingStep: 4,
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
}

