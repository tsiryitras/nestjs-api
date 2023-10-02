import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { HttpResponseService } from "../core/services/http-response/http-response.service";
import { TokenRequestService } from "./token-request.service";

/**
 * Controller for Token Request layer
 */
@Controller("token-request")
export class TokenRequestController {
  /**
   * Constructor for TokenRequestController
   * @param tokenRequestService Injected TokenRequestService
   */
  constructor(private readonly tokenRequestService: TokenRequestService) {}

  /**
   * Check token validity
   * @param checkTokenDto CheckTokenDto containing the token to be checked
   * @param res Fastify Response
   */
  @Post("check-validity")
  async checkTokenValidity(@Body() checkTokenDto, @Res() res) {
    const result = await this.tokenRequestService.checkTokenValidity(
      checkTokenDto.token
    );
    HttpResponseService.sendSuccess<boolean>(res, HttpStatus.OK, result);
  }
}
