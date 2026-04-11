import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ProductService } from '../product/product.service';
import { CampaignService } from '../campaign/campaign.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    private readonly productService: ProductService,
    private readonly campaignService: CampaignService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateSubmissionDto): Promise<Submission> {
    const product = await this.productService.findOne(dto.productId);
    const campaign = await this.campaignService.findOne(product.campaignId);

    const submission = this.submissionRepo.create({
      productId: dto.productId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });

    const saved = await this.submissionRepo.save(submission);

    this.mailService.sendSubmissionConfirmation({
      recipientName: dto.name,
      recipientEmail: dto.email,
      campaignName: campaign.campaignName,
      productName: product.productName,
      eventDate: product.eventDate,
    }).catch((err) => this.logger.error(`Failed to send email to ${dto.email}: ${err.message}`));

    return saved;
  }

  findAll(): Promise<Submission[]> {
    return this.submissionRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Submission> {
    const submission = await this.submissionRepo.findOneBy({ id });
    if (!submission) {
      throw new NotFoundException(`Submission "${id}" not found`);
    }
    return submission;
  }

  findByProductId(productId: string): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionRepo.remove(submission);
  }
}
