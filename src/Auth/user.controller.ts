

import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './Dto/create-user.dto';
import { UserServices } from './user.service';
import { Request, Response } from 'express';
import { Admin } from './entities/user.entity';
import { updateUserDto } from './Dto/update-user.dto';
import { JwtAuthGuard } from './auth.guard';
import { ApiExtraModels } from '@nestjs/swagger';


@ApiExtraModels()
@Controller('Admin')
export class UserController {
  constructor(private userServices: UserServices) {}
  // User Registration
  @Post('signup')
  async Register(
    @Body() userDto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ExistUser = await this.userServices.getUserByEmail(userDto.Email);
    if (ExistUser) {
      throw new HttpException(
        'User Already Exist,please try again with another email',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.userServices.Register(userDto);
    return res
      .status(HttpStatus.CREATED)
      .json({ status: 'success', message: 'user register successfully' });
  }

  @Post('signin')
  async login(
    @Body('Email') Email: string,
    @Body('Password') Password: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const token = await this.userServices.login(Email, Password);
    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'user login successfully',
      JwtToken: token,
    });
  }

  // verify token
  @Post('verify')
  async verify(@Body('jwtToken') jwtToken: string): Promise<Admin> {
    const user = await this.userServices.verifyToken(jwtToken);
    return user;
  }

  // all user

  @Get()
  @UseGuards(JwtAuthGuard)
  async FindAll(@Req() req: Request, @Res() res: Response) {
    const users = await this.userServices.FindAllUser();
    return res.status(HttpStatus.OK).json({ users });
  }

  // get user dashbboard
  @Get(':id')
  async userDashboard(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.userServices.findUserById(id);
    return res.status(HttpStatus.OK).json({ user });
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() userupdatedto: updateUserDto,
  ) {
    await this.userServices.UpdateUser(id, userupdatedto);
    return res
      .status(HttpStatus.OK)
      .json({ message: 'user updated successfully' });
  }

  @Delete(':id')
  async Deleteuser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.userServices.DeleteUser(id);
    return res.status(HttpStatus.OK).json({ message: 'user has deleted' });
  }
}