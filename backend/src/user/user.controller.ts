import { Controller, Get, Param, Post, Delete, Patch, Res, Request } from '@nestjs/common';
import { UserService } from './user.service';
import * as _ from 'lodash';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(@Res() res) {
    const users = await this.userService.getAll();

    res.send(users);
  }

  @Get('/:id')
  async get(@Param() params, @Res() res) {
    const user = await this.userService.find(params.id);

    res.send(user)
  }

  @Patch()
  async update(@Request() req, @Res() res) {
    const updatedUser = this.userService.update(req.body);

    res.send(_.omit(updatedUser, 'password'))
  }

  @Delete('/:id')
  async delete(@Param() params, @Res() res) {
    const deletedUser = await this.userService.delete(params.id);

    res.send(_.omit(deletedUser, 'password'));
  }
}
