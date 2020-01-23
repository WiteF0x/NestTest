import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as mailgun from 'mailgun-js';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { passwrodRecoveryPage } from '../constants/password.recovery';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
    ) { }

    async signUp(createUserDto: CreateUserDto) {
        const newUser = await this.userService.create(createUserDto);
        return newUser;
    }

    async signIn(email: string, pass: string) {
        const user = await this.userService.getUserByEmail(email);
        const { password, _id, roles } = user;
        const isValidPassword = await bcrypt.compare(pass, password);
        if (!isValidPassword) {
            throw new BadRequestException();
        }

        const generatedToken = await this.tokenService.generateToken(_id, roles)
        return { user, token: generatedToken.token };
    };

    async restorePassword(uId, oldPassword, newPassword, tok) {
        const token = tok.slice(7);
        const isExists = this.tokenService.exists(token);
        if (!isExists) throw new UnauthorizedException();

        return await this.userService.restorePassword(uId, oldPassword, newPassword)
    }

    async sendMessage(email) {
        const { _id, roles } = await this.userService.getUserByEmail(email);
        const { token } = await this.tokenService.generateToken(_id, roles);

        var DOMAIN = process.env.DOMAIN;
        var api_key = process.env.API_KEY;
        const mg = mailgun({apiKey: api_key, domain: DOMAIN});
        
        const data = {
            from: 'NestJs Service <opengeekslabdk@gmail.com>',
            to: email,
            subject: 'Reset password',
            html: passwrodRecoveryPage(token),
        };

        mg.messages().send(data, function(error, body) {
            console.log(body);
        });
    };

    async resetPassword(token: string, password: string,) {
        const decodedToken = this.jwtService.decode(token);
        const isExists = await this.tokenService.exists(token);
        if (!isExists) throw new UnauthorizedException();

        const user = await this.userService.resetPassword(decodedToken, password);
        if (!user._id) throw new BadRequestException();

        await this.tokenService.delete(user._id, token);
        return { success: true }
        
    }
}