import { Module } from '@nestjs/common';
import { ItemSizeController } from './item-size.controller.js';
import { ItemSizeService } from './item-size.service.js';
import { ItemSizeRepository } from './item-size.repository.js';
import { UserModule } from '../user/user.module.js';

@Module({
  controllers: [ItemSizeController],
  providers: [ItemSizeService, ItemSizeRepository],
  imports: [UserModule],
  exports: [ItemSizeRepository],
})
export class ItemSizeModule {}
