import { Controller, Request, Post, Get, UseGuards, Res, Body, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signin')
  async signIn(@Request() req, @Res() res) {
    const response = await this.authService.signIn(req.body.email, req.body.password);
    res.send(response);
  };

  @Post('/signup')
  async singUp(@Body() createUserDto: CreateUserDto, @Res() res) {
    const response = await this.authService.signUp(createUserDto);
    res.send(response);
  }
  
  @Patch('/restore-password')
  async restore(@Request() req, @Res() res) {
    const response = await this.authService.restorePassword(req.body.uId, req.body.oldPassword, req.body.newPassword, req.headers.authorization)
    res.send(response);
  }

  @Post('reset-password')
  async sendEmail(@Request() req, @Res() res) {
    await this.authService.sendMessage(req.body.email);
    res.send('Work!')
  }

  @Post('reset-password/:token')
  async reset(@Param() params, @Request() req, @Res() res) {
    const response = await this.authService.resetPassword(params.token, req.body.password)

    res.send(response);
  }
}

