import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { CategoriesEntity } from "@entities";
import { ProductImagesEntity } from "@entities";
import { ReviewsEntity } from "@entities";
import { CartItemsEntity } from "@entities";
import { OrderItemsEntity } from "@entities";

@Entity("products")
export class ProductsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CategoriesEntity, (category) => category.products)
  @JoinColumn({ name: "category_id" })
  category: CategoriesEntity;

  @OneToMany(() => ProductImagesEntity, (image) => image.product, {
    cascade: true,
  })
  images: ProductImagesEntity[];

  @OneToMany(() => ReviewsEntity, (review) => review.product)
  reviews: ReviewsEntity[];

  @OneToMany(() => CartItemsEntity, (item) => item.product)
  cartItems: CartItemsEntity[];

  @OneToMany(() => OrderItemsEntity, (item) => item.product)
  orderItems: OrderItemsEntity[];

  @Column({ type: "int", nullable: false })
  category_id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: "decimal", precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({ type: "boolean", default: false })
  is_trending: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
