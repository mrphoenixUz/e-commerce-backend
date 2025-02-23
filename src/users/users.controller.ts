import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/auth/roles.decorator';
import { RoleGuard } from 'src/auth/role.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin')
  async getUsers(@Request() req) {
    return this.usersService.findAll();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Put('update')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async updateUser(@Req() req, @Body() data) {
    return this.usersService.update(req.user.id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(parseInt(id, 10));
  }

  @Post('upload')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const fileExt = extname(file.originalname);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}${fileExt}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadProfilePicture(@UploadedFile() file: Express.Multer.File, @Req() req) {
    const pictureUrl = `/static/profiles/${file.filename}`;
    return this.usersService.updateProfilePicture(req.user.id, pictureUrl);
  }

  @Post('cart')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async addToCart(@Request() req, @Body('productId') productId: number, @Body('quantity') quantity: number) {
    return this.usersService.addToCart(req.user.id, productId, quantity);
  }

  @Put('cart')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async updateCart(
    @Request() req,
    @Body('productId') productId: number,
    @Body('quantity') quantity: number
  ) {
    return this.usersService.updateCart(req.user.id, productId, quantity);
  }


  @Delete('cart/:productId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async removeFromCart(@Request() req, @Param('productId') productId: number) {
    return this.usersService.removeFromCart(req.user.id, Number(productId));
  }


  @Post('favourites')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async addToFavourites(@Request() req, @Body('productId') productId: string) {
    return this.usersService.addToFavourites(req.user.id, productId);
  }

  @Delete('favourites/:productId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async removeFromFavourites(@Request() req, @Param('productId') productId: string) {
    return this.usersService.removeFromFavourites(req.user.id, productId);
  }

  @Post('orders')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('user')
  async addToOrders(
    @Request() req,
    @Body('productId') productId: number,
    @Body('quantity') quantity: number
  ) {
    return this.usersService.addToOrders(req.user.id, productId, quantity);
  }

  @Post('approve-admin/:userId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles("admin")
  async approveAdmin(@Request() req, @Param('userId') userId: number) {
    return this.usersService.approveAdmin(req.user.id, userId);
  }
}
