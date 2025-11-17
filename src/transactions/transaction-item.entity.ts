import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Book } from '../books/book.entity';
import { Transaction } from './transaction.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class TransactionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Exclude()
  @ManyToOne(() => Transaction, (t) => t.items)
  transaction: Transaction;

  @ManyToOne(() => Book)
  book: Book;

  @Column('int')
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  price: number;
}
