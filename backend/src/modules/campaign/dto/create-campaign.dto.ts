import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { CampaignStatus } from '../campaign.entity';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  campaignName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens (e.g. summer-sale)',
  })
  slug: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;
}
