import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignModule } from '../campaign/campaign.module';
import { Product } from './product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';


@Module({
  imports: [TypeOrmModule.forFeature([Product]), CampaignModule],
  controllers: [ProductController],
  providers: [ProductService], 
  exports: [ProductService],
})
export class ProductModule {}
