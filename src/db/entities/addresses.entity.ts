import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn, 
  JoinColumn 
} from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('addresses')
export class AddressesEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  city: string;

  @Column({ type: "varchar", length: 6, nullable: false })
  pincode: string;

  @Column({ type: "varchar", length: 100, nullable: false })
  state: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}