import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './modules/user/user.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CustomerModule } from './modules/customer/customer.module.js';
import { ItemModule } from './modules/item/item.module.js';
import { RentalModule } from './modules/rental/rental.module.js';
import { InvoiceModule } from './modules/invoice/invoice.module.js';
import { PaymentModule } from './modules/payment/payment.module.js';
import { StripeModule } from './modules/stripe/stripe.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    CustomerModule,
    ItemModule,
    RentalModule,
    InvoiceModule,
    PaymentModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
