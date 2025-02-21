import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepo.find({ relations: ['products'] });
  }

  findOne(id: number) {
    return this.categoriesRepo.findOne({ where: { id }, relations: ['products'] });
  }

  create(data: Partial<Category>) {
    const category = this.categoriesRepo.create(data);
    return this.categoriesRepo.save(category);
  }

  async update(id: number, data: Partial<Category>) {
    await this.categoriesRepo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    return this.categoriesRepo.delete(id);
  }
}
