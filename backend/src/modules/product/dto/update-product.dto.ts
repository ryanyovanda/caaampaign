import { IsString, IsNotEmpty } from "class-validator";

export class UpdateProductDto {
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