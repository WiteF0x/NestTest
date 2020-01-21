import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { envConfig } from './config/confige.root';
import { TokenModule } from './token/token.module';


@Module({
  imports: [
    UserModule,
    AuthModule,
    envConfig,
    MongooseModule.forRoot(
      process.env.MONGODB_WRITE_CONNECTION_STRING,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    ),
    TokenModule,
  ],
})
export class AppModule {}
