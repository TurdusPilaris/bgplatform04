import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../../users/domain/entities/user.sql.entity';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Users, (u) => u.sessions)
  user: Users;

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
