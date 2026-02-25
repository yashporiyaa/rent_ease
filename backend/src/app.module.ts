import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { validateEnv } from './config/env.validation.js';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CustomerModule } from './modules/customer/customer.module.js';
import { ItemModule } from './modules/item/item.module.js';
import { RentalModule } from './modules/rental/rental.module.js';
import { InvoiceModule } from './modules/invoice/invoice.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { StripeModule } from './modules/stripe/stripe.module.js';
import { ItemCategoryModule } from './modules/item-category/item-category.module.js';
import { ItemSizeModule } from './modules/item-size/item-size.module.js';
import { ReceiptModule } from './modules/receipt/receipt.module.js';
import { RentalPaymentModule } from './modules/rental-payment/rental-payment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 30,
        },
      ],
    }),
    PrismaModule,
    UserModule,
    CustomerModule,
    ItemModule,
    ItemCategoryModule,
    ItemSizeModule,
    RentalModule,
    InvoiceModule,
    PaymentModule,
    ReceiptModule,
    RentalPaymentModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
