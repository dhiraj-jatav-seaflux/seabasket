import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

import { Status } from "@types";
import { OrderItemsEntity } from "./order-items.entity";
import { UserEntity } from "./user.entity";

@Entity("orders")
export class OrderEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  user_id: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  total_amount: number;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.PENDING
  })
  status: Status;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItemsEntity, (items) => items.order)
  items: OrderItemsEntity[];

  @ManyToOne(()=>UserEntity,(user)=>user.orders)
  @JoinColumn({ name: "user_id" })
  user:UserEntity
}