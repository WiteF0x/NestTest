import { Controller, Request, Post, Get, UseGuards, Res, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signIn(@Request() req, @Res() res) {
    const response = await this.authService.signIn(req.body.email, req.body.password);
    res.send(response);
  };

  @Post('/register')
  async singUp(@Body() createUserDto: CreateUserDto, @Res() res) {
    const response = await this.authService.signUp(createUserDto);
    res.send(response);
  }
  
}

