import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartsEntity } from "@entities";
import { ProductsEntity } from "@entities";


@Entity("cart_items")
export class CartItemsEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'int', nullable:false})
    cart_id:number;

    @Column({type:'int',nullable:false})
    product_id:number;

    @Column({type:'int',nullable:false,default:1})
    quantity:number;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @ManyToOne(()=>CartsEntity,(cart)=>cart.items)
    @JoinColumn({ name: "cart_id" })
    cart: CartsEntity;

    @ManyToOne(() => ProductsEntity)
    @JoinColumn({ name: "product_id" })
    product: ProductsEntity;
}