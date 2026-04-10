import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
  ) {}

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const existing = await this.campaignRepo.findOneBy({ slug: dto.slug });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" is already in use`);
    }

    const campaign = this.campaignRepo.create({
      campaignName: dto.campaignName,
      slug: dto.slug,
      description: dto.description,
      status: dto.status,
    });

    return this.campaignRepo.save(campaign);
  }

  findAll(): Promise<Campaign[]> {
    return this.campaignRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOneBy({ id });
    if (!campaign) {
      throw new NotFoundException(`Campaign "${id}" not found`);
    }
    return campaign;
  }

  async findBySlug(slug: string): Promise<Campaign> {
    const campaign = await this.campaignRepo.findOneBy({ slug });
    if (!campaign) {
      throw new NotFoundException(`Campaign with slug "${slug}" not found`);
    }
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (dto.slug && dto.slug !== campaign.slug) {
      const existing = await this.campaignRepo.findOneBy({ slug: dto.slug });
      if (existing) {
        throw new ConflictException(`Slug "${dto.slug}" is already in use`);
      }
    }

    Object.assign(campaign, {
      ...(dto.campaignName !== undefined && { campaignName: dto.campaignName }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.status !== undefined && { status: dto.status }),
    });

    return this.campaignRepo.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepo.remove(campaign);
  }
}
