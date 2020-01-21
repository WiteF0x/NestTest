import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { CreateUserTokenDto } from '../token/dto/create-user-token.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser } from '../user/interfaces/user.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) { }

    async signUp(createUserDto: CreateUserDto) {
        const newUser = await this.userService.create(createUserDto);
        return newUser;
    }

    async signIn(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException();
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new BadRequestException();
        }
        const token = this.jwtService.sign({ _id: user._id, roles: user.roles })
        const date = new Date();
        date.setDate(new Date().getDate() + 1);
        const expireAt = moment(date).format('YYYY-MM-DD')
        const generatedToken = await this.tokenService.create({ token, uId: user._id, expireAt });
        return { success: true, token: generatedToken.token };
    }

    private async verifyToken(token): Promise<any> {
        try {
            const data = this.jwtService.verify(token);
            const tokenExists = await this.tokenService.exists(data._id, token);

            if (tokenExists) {
                return data;
            }
            throw new UnauthorizedException();
        } catch (error) {
            throw new UnauthorizedException();
        }
    }

    private async saveToken(createUserTokenDto: CreateUserTokenDto) {
        const userToken = await this.tokenService.create(createUserTokenDto);

        return userToken;
    }
}