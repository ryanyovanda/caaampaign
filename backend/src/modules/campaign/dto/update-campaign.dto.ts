import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { CampaignStatus } from '../campaign.entity';

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  campaignName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens (e.g. summer-sale)',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @IsString()
  @IsOptional()
  backgroundImage?: string;
}
