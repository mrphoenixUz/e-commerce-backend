import { IsString, IsNumber, IsArray, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsOptional()
  pictures: string[];

  @IsInt()
  @IsNotEmpty()
  category_id: number;
}
