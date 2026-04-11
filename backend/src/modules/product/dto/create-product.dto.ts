import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    campaignId: string;

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    @IsNotEmpty()
    eventDate: string;
}
