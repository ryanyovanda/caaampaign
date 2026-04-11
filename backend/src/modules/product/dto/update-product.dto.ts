import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateProductDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    campaignId?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    productName?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsDateString()
    @IsOptional()
    eventDate?: string;
}