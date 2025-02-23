import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.productsRepo.find({ relations: ['category'] });
  }

  findOne(id: number) {
    return this.productsRepo.findOne({ where: { id }, relations: ['category'] });
  }

  async create(data: CreateProductDto) {
    const category = await this.categoriesRepo.findOne({ where: { id: data.category_id } });
    if (!category) {
      throw new Error('Category not found');
    }

    const product = this.productsRepo.create({
      product_name: data.product_name,
      description: data.description,
      price: data.price,
      pictures: data.pictures || [],
      category,
    });

    return this.productsRepo.save(product);
  }

  async update(id: number, data: Partial<Product>) {
    await this.productsRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.productsRepo.delete(id);
  }

  async updateProductPictures(id: number, pictureUrls: string[]) {
    await this.productsRepo.update(id, { pictures: pictureUrls });
    return this.productsRepo.findOne({ where: { id } });
  }

  async search(query: string) {
    return this.productsRepo.find({
      where: { product_name: ILike(`%${query}%`) },
      relations: ['category'],
    });
  }
  
}
