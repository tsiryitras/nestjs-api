import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginResponseDto } from "../auth/dto/login-responce.dto";
import { GenericApiOkResponse } from "../core/decorators/generic-api-ok-response.decorator";
import { RequirePermissions } from "../core/decorators/require-permissions.decorator";
import { HttpResponseService } from "../core/services/http-response/http-response.service";
import { PermissionName } from "../permission/entities/permission.entity";
import { CsvExportCriteria } from "../shared/types/csv-export-criteria";
import { ListCriteria } from "../shared/types/list-criteria.class";
import { BatchUserInsertReportDto } from "./dto/batch-insert-user-report.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserFilter } from "./entities/user.entity";
import { PaginatedUsers } from "./paginated-users.interface";
import { UserService } from "./user.service";

/**
 * Controller for User layer
 */
@Controller("user")
export class UserController {
  /**
   * Constructor for UserController
   * @param userService Injected User Service
   */
  constructor(private readonly userService: UserService) {}

  /**
   * Get paginated list of User based on list criteria
   * @param queryParams List criteria to find Users
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "Paginated users",
    type: User,
    isArray: false,
  })

  // @RequirePermissions(PermissionName.VIEW_USER)
  @Get()
  async getPaginated(
    @Query() queryParams: ListCriteria,
    @Res() res: FastifyReply
  ) {
    const results: PaginatedUsers = await this.userService.getPaginated(
      queryParams
    );
    HttpResponseService.sendSuccess<PaginatedUsers>(
      res,
      HttpStatus.OK,
      results
    );
  }

  /**
   * Find User by its _id
   * @param id _id of given User
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "The corresponding record to the id",
    type: User,
  })
  // @RequirePermissions(PermissionName.VIEW_USER)
  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: FastifyReply) {
    const result = await this.userService.findOne(id);
    HttpResponseService.sendSuccess<User>(res, HttpStatus.OK, result);
  }

  /**
   * Create user
   * @param createUserDto User that will be create
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "The created user record",
    type: User,
  })
  // @RequirePermissions(PermissionName.CREATE_USER)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: FastifyReply) {
    const result = await this.userService.create(createUserDto);
    HttpResponseService.sendSuccess<User>(res, HttpStatus.CREATED, result);
  }

  /**
   * Update User
   * @param id _id of User
   * @param updateUserDto update of User
   * @param res Fastify Response
   */
  @GenericApiOkResponse({
    description: "The updated user record",
    type: User,
  })
  // @RequirePermissions(PermissionName.EDIT_USER)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: FastifyReply
  ) {
    const result = await this.userService.update(id, updateUserDto);
    HttpResponseService.sendSuccess<User>(res, HttpStatus.OK, result);
  }

  /**
   * Check duplicated email or userName
   * @param userToCheckDuplication partial User
   * @param res Fastify Response
   */
  @GenericApiOkResponse({
    description: "Check duplicated entry",
    type: Boolean,
  })
  // @RequirePermissions(PermissionName.EDIT_USER)
  @Post("check-duplication")
  async checkDuplication(
    @Body() userToCheck: UpdateUserDto,
    @Res() res: FastifyReply
  ) {
    const result = await this.userService.checkDuplication(userToCheck);
    HttpResponseService.sendSuccess<boolean>(res, HttpStatus.OK, result);
  }

  /**
   * Remove User with specific _id
   * @param id _id of User to be deleted
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "Check if delete is successful",
    type: Boolean,
  })
  // @RequirePermissions(PermissionName.DELETE_USER)
  @Delete(":id")
  async remove(@Param("id") id: string, @Res() res) {
    const result = await this.userService.remove(id);
    HttpResponseService.sendSuccess<boolean>(res, HttpStatus.OK, result);
  }

  /**
   * Request password reset,
   * @param passwordResetDto Dto with user email
   * @param res Fastify Response
   */
  @Post("request-password-reset")
  async requestPasswordReset(
    @Body() passwordResetDto: RequestPasswordResetDto,
    @Res() res
  ) {
    await this.userService.requestPasswordReset(passwordResetDto.email);
    HttpResponseService.sendSuccess<boolean>(res, HttpStatus.OK, true);
  }

  /**
   * Reset password, the request must include valid token and new password
   * @param resetPasswordDto Dto with token and new password
   * @param res Fastify response
   */
  @Post("reset-password")
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res) {
    const result = await this.userService.resetPassword(
      resetPasswordDto.password,
      resetPasswordDto.token
    );
    HttpResponseService.sendSuccess<LoginResponseDto>(
      res,
      HttpStatus.OK,
      result
    );
  }
}
