import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserSQL } from '../../users/domain/entities/user.sql.entity';

@Entity({ name: 'sessions' })
export class SessionSQL {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserSQL, (u) => u.sessions)
  user: UserSQL;

  @Column()
  deviceId: string;

  @Column()
  iat: Date;

  @Column()
  deviceName: string;

  @Column()
  ip: string;

  @Column()
  exp: Date;
}
