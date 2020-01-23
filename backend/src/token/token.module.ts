import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TokenService } from './token.service';
import { TokenSchema } from './schemas/user-token.schema';
import { envConfig } from '../config/confige.root';

@Module({
  imports: [
    envConfig,
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
