import { Module } from '@nestjs/common';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { ItemRepository } from './item,repository.js';
import { UserModule } from '../user/user.module.js';
import { ItemCategoryModule } from '../item-category/item-category.module.js';
import { ItemSizeModule } from '../item-size/item-size.module.js';

@Module({
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
  imports: [UserModule, ItemCategoryModule, ItemSizeModule],
})
export class ItemModule {}
