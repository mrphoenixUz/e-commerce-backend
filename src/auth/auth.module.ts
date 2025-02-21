import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule, JwtModule.register({ secret: 'your_secret_key' })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthGuard],
})
export class AuthModule {}