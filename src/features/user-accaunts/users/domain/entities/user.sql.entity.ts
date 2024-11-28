import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Sessions } from '../../../security/domain/session.sql';

@Entity()
export class UserTor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userName: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  createdAt: Date;

  @Column()
  confirmationCode: string;

  @Column()
  expirationDate: Date;

  @Column({ default: false })
  isConfirmed: boolean;

  @OneToMany(() => Sessions, (w) => w.user)
  sessions: Sessions[];
}
