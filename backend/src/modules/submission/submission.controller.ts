import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@Controller('submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionService.create(dto);
  }

  @Get()
  findAll() {
    return this.submissionService.findAll();
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.submissionService.findByProductId(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.submissionService.remove(id);
  }
}
