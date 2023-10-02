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
import { GenericApiOkResponse } from "../core/decorators/generic-api-ok-response.decorator";
import { RequirePermissions } from "../core/decorators/require-permissions.decorator";
import { HttpResponseService } from "../core/services/http-response/http-response.service";
import { PermissionName } from "../permission/entities/permission.entity";
import { ListCriteria } from "../shared/types/list-criteria.class";
import { Paginated } from "../shared/types/page.interface";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "./entities/role.entity";
import { RoleService } from "./role.service";

/**
 * Controller for Role layer
 */
@Controller("role")
export class RoleController {
  /**
   * Constructor for RoleController
   * @param roleService Injected RoleService
   */
  constructor(private readonly roleService: RoleService) {}

  /**
   * Create role
   * @param createRoleDto Role that will be created
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "The created role record",
    type: Role,
  })
  // @RequirePermissions(PermissionName.CREATE_ROLE)
  @Post()
  async create(@Body() createRoleDto: CreateRoleDto, @Res() res: FastifyReply) {
    const result = await this.roleService.create(createRoleDto);
    HttpResponseService.sendSuccess<Role>(res, HttpStatus.CREATED, result);
  }

  /**
   * Get all Roles inside database
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "All role records found",
    type: Role,
    isArray: true,
  })
  @Get("/all")
  async findAll(@Res() res: FastifyReply) {
    const results: Role[] = await this.roleService.findAll();
    HttpResponseService.sendSuccess<Role[]>(res, HttpStatus.OK, results);
  }

  /**
   * Get paginated list of Role based on list criteria
   * @param queryParams List criteria to find Roles
   * @param res Fastify Response
   */
  @GenericApiOkResponse({
    description: "Paginated roles",
    type: Role,
    isArray: false,
  })
  @RequirePermissions(PermissionName.VIEW_ROLE)
  @Get()
  async getPaginated(
    @Query() queryParams: ListCriteria,
    @Res() res: FastifyReply
  ) {
    const results: Paginated<Role> = await this.roleService.getPaginated(
      queryParams
    );
    HttpResponseService.sendSuccess<Paginated<Role>>(
      res,
      HttpStatus.OK,
      results
    );
  }

  /**
   * Find a Role by its _id
   * @param id _id of the Role
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "The corresponding record to the id",
    type: Role,
  })
  @RequirePermissions(PermissionName.VIEW_ROLE)
  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: FastifyReply) {
    const result = await this.roleService.findOne(id);
    HttpResponseService.sendSuccess<Role>(res, HttpStatus.OK, result);
  }

  /**
   * Update Role
   * @param id _id of Role
   * @param updateRoleDto update of Role
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "The updated role record",
    type: Role,
  })
  @RequirePermissions(PermissionName.EDIT_ROLE)
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res() res: FastifyReply
  ) {
    const result = await this.roleService.update(id, updateRoleDto);
    HttpResponseService.sendSuccess<Role>(res, HttpStatus.OK, result);
  }

  /**
   * Remove Role with specific _id
   * @param id _id of Role to be deleted
   * @param res Fastify response
   */
  @GenericApiOkResponse({
    description: "Check if delete is successful",
    type: Boolean,
  })
  @RequirePermissions(PermissionName.DELETE_ROLE)
  @Delete(":id")
  async remove(@Param("id") id: string, @Res() res) {
    const result = await this.roleService.remove(id);
    HttpResponseService.sendSuccess<boolean>(res, HttpStatus.OK, result);
  }

  /**
   * Get list of suggestions for search ba
   * @param search search query
   * @param req Fastify Request
   * @param res Fastify Response
   */
  @GenericApiOkResponse({
    description: "Get list of suggestions for search bar",
    type: String,
    isArray: true,
  })
  @Post("suggestions")
  async requestSuggestions(
    @Body() search: string,
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply
  ) {
    const result = await this.roleService.getRequestSuggestions(search);
    HttpResponseService.sendSuccess<string[]>(res, HttpStatus.OK, result);
  }
}
