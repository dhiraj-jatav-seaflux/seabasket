import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ProductsEntity } from "@entities";

@Entity("product_images")
export class ProductImagesEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:"int", nullable:false})
    product_id:number;

    @Column({type:"varchar", length:250})
    image_url:string;

    @Column({type:'varchar', length:255})
    public_id:string;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @ManyToOne(()=>ProductsEntity, (product)=>product.images,{onDelete:'CASCADE'})
    @JoinColumn({name:"product_id"})
    product:ProductsEntity;
}