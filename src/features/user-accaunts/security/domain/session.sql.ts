import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserTor } from '../../users/domain/entities/user.sql.entity';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserTor, (u) => u.sessions)
  user: UserTor;

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
