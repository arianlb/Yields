import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';
import { ValidRoles } from '../interfaces/valid-roles';

export function Auth(...roles: ValidRoles[]) {
    return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AuthGuard(), UserRoleGuard),
    );
}