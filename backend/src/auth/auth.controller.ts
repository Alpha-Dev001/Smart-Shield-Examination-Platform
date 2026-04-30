import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards';
import { GetUser } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /api/auth/register
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // POST /api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK) // override default 201 to 200 for login
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // GET /api/auth/me  — protected route
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}