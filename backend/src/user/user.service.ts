import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenService } from '../token/token.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUser>,
    private readonly tokenService: TokenService,
    ) {}

  async getAll() {
    return await this.userModel.find().exec();
  }

  async getUserByEmail(email) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException();
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(createUserDto.password, salt);

    const createdUser = new this.userModel(_.assignIn(createUserDto, { password: hash }));
    return await createdUser.save();
  };

  async find(id: string): Promise<IUser> {
    const user = await this.userModel.findById(mongoose.Types.ObjectId(id)).exec();

    if (!user) {
      throw new BadRequestException();
    }
    return user;
  };

  async update(user: UpdateUserDto): Promise<Partial<IUser>> {
    const updatedUser = await this.userModel.aggregate([
      { $match: { email: user.email } },
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

  async delete(id: string): Promise<IUser> {
    const deletedUser = this.userModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });

    if (!deletedUser) {
      throw new BadRequestException();
    }
    return deletedUser;
  };

  async restorePassword(uId, oldPassword, newPassword) {
    const user = await this.userModel.findById(uId);
    if (oldPassword !== user.password) throw new BadRequestException();

    const updatedUser = await this.userModel.findOneAndUpdate({ _id: uId }, { $set: { password: newPassword } });
    if (!updatedUser) throw new ForbiddenException();

    await this.tokenService.deleteAll(uId);
    const generatedToken = await this.tokenService.generateToken(uId, user.roles)

    return { user, token: generatedToken.token }
  };

  async resetPassword(token, password ) {
    if (password.length < 4) throw new BadRequestException();

    const user = await this.userModel.findOneAndUpdate({ _id: token._id }, { $set: { password } })
    if (!user._id) {
      throw new ForbiddenException();
    }
    return user;
  }

}
