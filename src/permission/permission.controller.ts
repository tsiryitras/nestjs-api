import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { GenericApiOkResponse } from '../core/decorators/generic-api-ok-response.decorator';
import { HttpResponseService } from '../core/services/http-response/http-response.service';
import { Permission } from './entities/permission.entity';
import { PermissionService } from './permission.service';
/**
 * Controller for Permission layer
 */
@Controller('permission')
export class PermissionController {
    /**
     * Constructor for PermissionController
     * @param permissionService Injected Permission Service
     */
    constructor(private readonly permissionService: PermissionService) {}

    /**
     * Find all Permissions
     * @param res Fastify Response
     */
    @GenericApiOkResponse({
        description: 'All permission records found',
        type: Permission,
        isArray: true,
    })
    @Get('/all')
    async findAll(@Res() res: FastifyReply) {
        const results: Permission[] = await this.permissionService.findAll();
        HttpResponseService.sendSuccess<Permission[]>(res, HttpStatus.OK, results);
    }
}
