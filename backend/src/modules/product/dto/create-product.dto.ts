import { IsString, IsNotEmpty } from "class-validator";

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
}
