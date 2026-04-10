import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) {}

    async create(dto: CreateProductDto): Promise<Product> {
        const existing = await this.productRepo.findOneBy({productName: dto.productName})
        if(existing) {
            throw new ConflictException(`Product "${dto.productName}" is already in use`)
        }
        
        const product = this.productRepo.create({
            campaignId: dto.campaignId,
            productName: dto.productName,
            description: dto.description,
        })

        return this.productRepo.save(product)
    }

    async findAll(): Promise<Product[]> {
        return this.productRepo.find({ order: { createdAt: 'DESC' } })
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productRepo.findOneBy({ id })
        if (!product) {
            throw new NotFoundException(`Product "${id}" not found`)
        }
        return product
    }

    async findByCampaignId(campaignId: string): Promise<Product[]> {
        const product = await this.productRepo.find({ where: { campaignId } })
        if (!product) {
            throw new NotFoundException(`Product "${campaignId}" not found`)
        }
        return product
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id)

        if (dto.productName && dto.productName !== product.productName) {
            const existing = await this.productRepo.findOneBy({ productName: dto.productName })
            if (existing) {
                throw new ConflictException(`Product "${dto.productName}" is already in use`)
            }
        }

        Object.assign(product, {
            ...(dto.campaignId !== undefined && { campaignId: dto.campaignId }),
            ...(dto.productName !== undefined && { productName: dto.productName }),
            ...(dto.description !== undefined && { description: dto.description }),
        })

        return this.productRepo.save(product)
    }

    async remove(id: string): Promise<void> {
        const product = await this.findOne(id)
        await this.productRepo.remove(product)
    }
}