import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { HttpResponseService } from "../core/services/http-response/http-response.service";
import { AuthService } from "./auth.service";
import { LoginResponseDto } from "./dto/login-responce.dto";
import { LocalAuthGuard } from "./local-auth.guard";

/**
 * Controller for authentication layer
 */
@Controller()
export class AuthController {
  /**
   * Constructor of AuthController
   * @param authService Authentication service
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint used for login
   * @param req Fastify request
   * @param res Fastify response
   */
  // @UseGuards(LocalAuthGuard)
  @Post("authentication/login")
  async login(@Request() req, @Res() res: FastifyReply) {
    const result = await this.authService.login(req.user);
    HttpResponseService.sendSuccess<LoginResponseDto>(
      res,
      HttpStatus.OK,
      result
    );
  }
}
