import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  async create(dto: CreateSubmissionDto): Promise<Submission> {
    const submission = this.submissionRepo.create({
      productId: dto.productId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });

    return this.submissionRepo.save(submission);
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
      order: { createdAt: 'DESC' } 
    });
  }

  async remove(id: string): Promise<void> {
    const submission = await this.findOne(id);
    await this.submissionRepo.remove(submission);
  }
}
