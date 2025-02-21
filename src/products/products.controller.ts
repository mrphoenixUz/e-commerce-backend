import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) { }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productsService.delete(id);
  }

  @Post('upload/:id')
  // @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 5, { // Allow max 5 pictures
      storage: diskStorage({
        destination: './uploads/products', // Store in "uploads/products"
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}${fileExt}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.jfif'];

        const fileExt = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
          return callback(new BadRequestException('Only PNG, JPG, JFIF, and JPEG files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadProductPictures(@Param('id') id: number, @UploadedFiles() files: Express.Multer.File[]) {
    console.log("files", files);
    console.log("id", id);
    if (!files || files.length === 0) {
      throw new BadRequestException("No valid files uploaded.");
    }
    const pictureUrls = files.map((file) => `/static/products/${file.filename}`);
    return this.productsService.updateProductPictures(id, pictureUrls);
  }

  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.productsService.search(query);
  }
}
