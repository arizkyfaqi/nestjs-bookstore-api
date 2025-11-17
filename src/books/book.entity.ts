import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  author: string;

  @Column({
    type: 'varchar',
    length: 1500,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  stock: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  coverUrl: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  thumbnailUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
