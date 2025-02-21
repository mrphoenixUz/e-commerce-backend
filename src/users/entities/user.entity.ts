import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type OrderItem = { productId: number; price?: number; quantity: number };

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column("simple-array", { default: "" })
  favourites: string[];

  @Column("simple-json", { default: "[]" })
  cart: OrderItem[];

  @Column("simple-json", { default: "[]" })
  orders: OrderItem[];

  @Column({ nullable: true })
  profile_picture: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;
}
