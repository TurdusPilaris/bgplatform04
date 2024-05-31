import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: '123', signOptions: { expiresIn: '60s' } }),
  ],
  // providers: [AuthService, LocalStrategy, JwtStrategy],
  // exports: [AuthService],
})
@Module({})
export class AuthModule {}
