import { Module } from '@nestjs/common';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { ItemRepository } from './item,repository.js';
import { UserModule } from '../user/user.module.js';

@Module({
  controllers: [ItemController],
  providers: [ItemService, ItemRepository],
  imports: [UserModule],
})
export class ItemModule {}
