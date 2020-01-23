import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import * as moment from 'moment';
import { JwtService } from '@nestjs/jwt';
import { IUserToken } from './interfaces/user-token.interface';
import { CreateUserTokenDto } from './dto/create-user-token.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel('Token') private readonly tokenModel: Model<IUserToken>,
    private readonly jwtService: JwtService,
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
  };

  async generateToken(_id, roles: Array<string>): Promise<IUserToken> {
    const token = this.jwtService.sign({ _id, roles })
    console.log('here')
    const date = new Date();
    date.setDate(new Date().getDate() + 1);
    const expireAt = moment(date).format('YYYY-MM-DD')
    return await this.create({ token, uId: _id, expireAt });
  }

}
