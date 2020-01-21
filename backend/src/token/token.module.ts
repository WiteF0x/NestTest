import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from './token.service';
import { TokenSchema } from './schemas/user-token.schema';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Token', schema: TokenSchema },
      { name: 'User', schema: UserSchema }
    ]),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
