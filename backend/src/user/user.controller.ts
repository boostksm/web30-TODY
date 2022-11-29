import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, ReadUserDto } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('signup')
  async signup(@Body() userData: CreateUserDto): Promise<{ nickname: string }> {
    const { nickname } = await this.userService.createUser(userData);
    return { nickname };
  }

  @Get('checkID/:id')
  async findOneById(
    @Param('id') id: string,
  ): Promise<{ isUnique: boolean; id: string }> {
    const checkId = await this.userService.findOneById({ id });
    return checkId ? { isUnique: false, id } : { isUnique: true, id };
  }

  @Get('checkNickname/:nickname')
  async findOneByNickname(
    @Param('nickname') nickname: string,
  ): Promise<{ isUnique: boolean; nickname: string }> {
    const checkNickname = await this.userService.findOneByNickname({
      nickname,
    });
    return checkNickname
      ? { isUnique: false, nickname }
      : { isUnique: true, nickname };
  }

  @Post('login')
  async login(@Body() userData: ReadUserDto): Promise<{ accessToken: string }> {
    const { accessToken } = await this.userService.login(userData);
    return { accessToken };
  }
}
