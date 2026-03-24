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

import { PaymentMode, Status } from "@types";
import { OrderItemsEntity } from "@entities";
import { UserEntity } from "@entities";

@Entity("orders")
export class OrderEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  user_id: number;

  @Column({type:'varchar', length:255, nullable:true, unique:true})
  stripe_session_id:string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  total_amount: number;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.PENDING
  })
  status: Status;

  @Column({type:"enum", enum:PaymentMode, default:PaymentMode.COD})
  payment_mode:PaymentMode;

  @Column({type:'text', nullable:false})
  delivery_address:string

  @Column({type:"varchar", length:100, nullable:false})
  city:string

  @Column({type:"varchar", length:6, nullable:false})
  pincode:string

  @Column({type:"varchar", length:100, nullable:false})
  state:string

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