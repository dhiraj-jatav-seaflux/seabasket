import { UserRole } from "@types";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReviewsEntity } from "./reviews.entity";
import { CartsEntity } from "./carts.entity";
import { OrderEntity } from "./orders.entity";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100, nullable: false })
  first_name: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  last_name: string;

  @Column({type:"varchar", length:100, nullable:false, unique:true})
  email:string

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({type:"varchar", length:15, nullable:false})
  phone:string

  @Column({type:"enum", enum:UserRole, default:UserRole.USER})
  role:UserRole

  @Column({type:"text", nullable:false})
  address:string

  @Column({type:"varchar", length:100, nullable:false})
  city:string

  @Column({type:"varchar", length:6, nullable:false})
  pincode:string

  @Column({type:"varchar", length:100, nullable:false})
  state:string

  @Column({type:"varchar", length:6})
  login_otp:string

  @Column({type:"timestamp"})
  login_otp_expiration:Date;

  @Column({type:"varchar", length:255})
  reset_token:string

  @Column({type:"timestamp"})
  reset_token_expiration:Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ReviewsEntity, (review) => review.user)
  reviews: ReviewsEntity[];

  @OneToOne(()=>CartsEntity,(cart)=>cart.user)
  cart:CartsEntity

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}