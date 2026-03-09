import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { ProductsEntity } from "./products.entity";

@Entity("categories")
export class CategoriesEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:"varchar", length:50, nullable:false, unique:true})
    category_name:string

    @CreateDateColumn()
    created_at: Date;
    
    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => ProductsEntity, (product) => product.category)
    products: ProductsEntity[];
}