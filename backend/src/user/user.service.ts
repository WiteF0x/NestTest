import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import * as mongoose from 'mongoose';


@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async getAll(): Promise<Array<IUser>> {
    return await this.userModel.find().exec();
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel(_.assignIn(createUserDto, { password: hash }));
    return await createdUser.save();
  };

  async find(id: IUser['_id']): Promise<IUser> {
    const user = await this.userModel.findById(mongoose.Types.ObjectId(id)).exec();

    if (!user) {
      throw new BadRequestException();
    }
    return user;
  };

  async update(user: Partial<IUser>): Promise<Partial<IUser>> {
    const updatedUser = await this.userModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(user._id) } },
      { $set: { ...user } },
      { $project: {
        email: 1,
        firstName: 1,
        lastName: 1,
        roles: 1,
      } }
    ]);

    if (!updatedUser) {
      throw new BadRequestException();
    }
    return updatedUser;
  };

  async delete(id: IUser['_id']): Promise<IUser> {
    const deletedUser = this.userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });

    if (!deletedUser) {
      throw new BadRequestException();
    }
    return deletedUser;
  }
}
