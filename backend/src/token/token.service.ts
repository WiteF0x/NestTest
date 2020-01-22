import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IUserToken } from './interfaces/user-token.interface';
import { CreateUserTokenDto } from './dto/create-user-token.dto';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<IUserToken>,
    @InjectModel('User') private readonly userModel: Model<IUser>
    ) { }

  async create(createUserTokenDto: CreateUserTokenDto): Promise<IUserToken> {
    const userToken = new this.tokenModel(createUserTokenDto);
    return await userToken.save();
  };

  async delete(uId: string, token: string): Promise<{ ok?: number, n?: number }> {
    return await this.tokenModel.deleteOne({ uId, token });
  };

  async deleteAll(uId: string): Promise<{ ok?: number, n?: number }> {
    return await this.tokenModel.deleteMany({ uId });
  };

  async exists(token: string): Promise<boolean> {
    return await this.tokenModel.exists({ token });
  }

  async verify(token: any): Promise<boolean> {
    const user = await this.userModel.findById(mongoose.Types.ObjectId(token._id));

    if (user.roles.length === token.roles.length) {
      return !_.difference(user.roles, token.roles)[0] ? true : false;
    } else {
      throw new UnauthorizedException();
    }
  }
}
