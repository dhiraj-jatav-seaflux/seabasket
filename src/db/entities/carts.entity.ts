import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { CartItemsEntity } from "./cart-items.entity";


@Entity("carts")
export class CartsEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'int',nullable:false})
    user_id:number;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @OneToOne(()=>UserEntity,(user)=>user.cart)
    @JoinColumn({name:"user_id"})
    user:UserEntity

    @OneToMany(() => CartItemsEntity, (item) => item.cart)
    items: CartItemsEntity[];
}