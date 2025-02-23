import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem, UserRole, Users } from './entities/user.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(Users) private usersRepo: Repository<Users>, private readonly productsService: ProductsService) { }

  async findAll(): Promise<Users[]> {
    return this.usersRepo.find();
  }

  async findById(id: number): Promise<Users> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.usersRepo.findOneBy({ email });
  }

  async create(data: Partial<Users>) {
    const existingUsers = await this.usersRepo.count();

    const user = this.usersRepo.create({
      ...data,
      role: existingUsers === 0 ? UserRole.ADMIN : UserRole.USER,
    });

    return this.usersRepo.save(user);
  }


  async update(id: number, data: Partial<Users>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    await this.usersRepo.delete(id);
    return { message: 'User deleted successfully' };
  }

  async updateProfilePicture(id: number, profilePictureUrl: string) {
    await this.usersRepo.update(id, { profile_picture: profilePictureUrl });
    return this.findById(id);
  }

  async addToCart(userId: number, productId: number, quantity: number) {
    const user = await this.findById(userId);

    const product = await this.productsService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let cart: OrderItem[] = user.cart || [];

    const existingProductIndex = cart.findIndex(item => item.productId == productId);

    if (existingProductIndex > -1) {
      cart[existingProductIndex].quantity += quantity;
    } else {
      cart.push({ productId, price: product.price, quantity });
    }

    user.cart = cart;
    return this.usersRepo.save(user);
  }

  async updateCart(userId: number, productId: number, quantity: number) {
    const user = await this.findById(userId);

    let cart: OrderItem[] = Array.isArray(user.cart) ? user.cart : [];

    const existingProductIndex = cart.findIndex(item => item.productId === productId);

    if (existingProductIndex > -1) {
      if (quantity > 0) {
        cart[existingProductIndex].quantity = quantity;
      } else {
        cart.splice(existingProductIndex, 1);
      }
    } else {
      throw new NotFoundException(`Product with ID ${productId} not found in cart`);
    }

    user.cart = cart;
    return this.usersRepo.save(user);
  }

  async removeFromCart(userId: number, productId: number) {
    const user = await this.findById(userId);
    let cart: OrderItem[] = user.cart || [];

    // Filter out the product that needs to be removed
    cart = cart.filter(item => item.productId != productId);

    user.cart = cart;
    return this.usersRepo.save(user);
  }


  async addToFavourites(userId: number, productId: string) {
    const user = await this.findById(userId);
    user.favourites = Array.isArray(user.favourites) ? user.favourites : [];
    user.favourites = [...new Set([...user.favourites, productId])];

    return this.usersRepo.save(user);
  }



  async removeFromFavourites(userId: number, productId: string) {
    const user = await this.findById(userId);
    user.favourites = Array.isArray(user.favourites) ? user.favourites : [];
    user.favourites = user.favourites.filter(id => id !== productId);

    return this.usersRepo.save(user);
  }


  async addToOrders(userId: number, productId: number, quantity: number) {
    const user = await this.findById(userId);
    let orders: OrderItem[] = user.orders || [];

    const existingOrderIndex = orders.findIndex(order => order.productId == productId);

    if (existingOrderIndex > -1) {
      orders[existingOrderIndex].quantity += quantity;
    } else {
      orders.push({ productId, quantity });
    }

    user.orders = orders;
    return this.usersRepo.save(user);
  }

  async approveAdmin(requesterId: number, userId: number) {
    const requester = await this.findById(requesterId);
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Only admins can approve new admins.");
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException("User is already an admin.");
    }

    user.role = UserRole.ADMIN;
    return this.usersRepo.save(user);
  }

}
