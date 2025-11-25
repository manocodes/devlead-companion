import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { GoogleAuthGuard } from './google.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private userService: UserService,
    ) { }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req) {
        // Initiates Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        // Extract user data from Google OAuth
        const { email, firstName, lastName, picture } = req.user;
        const fullName = `${firstName} ${lastName}`.trim();

        // Create or update user in database
        const user = await this.userService.findOrCreate({
            email,
            name: fullName,
            avatar_url: picture,
        });

        // Generate JWT token with user ID and email
        const payload = { email: user.email, sub: user.id };
        const token = this.jwtService.sign(payload);

        // Redirect to frontend with token
        const frontendUrl = this.configService.get('FRONTEND_URL');
        res.redirect(`${frontendUrl}?token=${token}`);
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt'))
    getProfile(@Req() req) {
        return req.user;
    }
}
