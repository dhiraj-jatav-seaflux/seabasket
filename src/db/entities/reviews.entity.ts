import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductsEntity } from "@entities";
import { UserEntity } from "@entities";

@Entity("reviews")
export class ReviewsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  user_id: number;

  @Column({ type: "int", nullable: false })
  product_id: number;

  @Column({ type: "int", nullable: false })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(
    () => UserEntity,
    user => user.reviews,
  )
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @ManyToOne(
    () => ProductsEntity,
    product => product.reviews,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "product_id" })
  product: ProductsEntity;
}
