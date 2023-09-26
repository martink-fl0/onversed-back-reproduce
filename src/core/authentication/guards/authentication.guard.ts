import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { AuthenticationService } from '../services';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly service: AuthenticationService,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const gqlContext: GqlExecutionContext = GqlExecutionContext.create(context);
        const { req } = gqlContext.getContext();

        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const user: boolean|any = await this.service.validateToken(token);

            if (!user) {
                return false;
            } else if (!user.is_active) {
                return false;
            }

            req.user = user;

            const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            return true;
        }

        return false;
    }
}
