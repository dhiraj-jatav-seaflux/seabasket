import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn
} from "typeorm";

import { OrderEntity } from "@entities";
import { ProductsEntity } from "@entities";

@Entity("order_items")
export class OrderItemsEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  order_id: number;

  @Column({ type: "int", nullable: false })
  product_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => OrderEntity, (order) => order.items)
  @JoinColumn({ name: "order_id" })
  order: OrderEntity;

  @ManyToOne(() => ProductsEntity)
  @JoinColumn({ name: "product_id" })
  product: ProductsEntity;
}