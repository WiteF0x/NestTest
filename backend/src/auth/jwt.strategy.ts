import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '../token/token.service';
import { IUser } from '../user/interfaces/user.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    })
  }

  // async validator(req, user: Partial<IUser>) {
  async validator(req) {
    const token = req.headers.authorization.slice(7);
    const tokenExists = await this.tokenService.exists(token);
    if (!tokenExists) {
      throw new UnauthorizedException();
    }

    const decodedToken = this.jwtService.decode(token);
    const isVerified = await this.tokenService.verify(decodedToken)
    if (!isVerified) {
      throw new UnauthorizedException();
    }
  }
}