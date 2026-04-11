import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
import { SubmissionController } from './submission.controller';
import { SubmissionService } from './submission.service';
import { ProductModule } from '../product/product.module';
import { CampaignModule } from '../campaign/campaign.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    ProductModule,
    CampaignModule,
    MailModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
