import { Module } from '@nestjs/common';
import { ItemCategoryController } from './item-category.controller.js';
import { ItemCategoryService } from './item-category.service.js';
import { ItemCategoryRepository } from './item-category.repository.js';
import { UserModule } from '../user/user.module.js';

@Module({
  controllers: [ItemCategoryController],
  providers: [ItemCategoryService, ItemCategoryRepository],
  imports: [UserModule],
  exports: [ItemCategoryRepository],
})
export class ItemCategoryModule {}
