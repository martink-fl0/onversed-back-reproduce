import { SetMetadata, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserCustomerService, UserEmployeeService, UserService } from '../services';

import {
    UserMe,
    UserTokens,
    UserCustomerInput,
    UserEmployeeInput,
    UserLoginEmailInput,
    UserUpdateEmailInput,
    UserChangePasswordInput,
    UserUpdatePasswordInput,
    UserRecoverPasswordInput,
    UserLoginMobileCodeInput,
    UserLoginMobilePhoneInput,
    UserUpdateMobilePhoneInput,
} from '../gql';
import { AuthenticationGuard } from "../../../core/authentication/guards";
import { UserEntity } from "../../../entities/user.entity";

@Resolver()
export class UserResolver {
    constructor(
        private readonly service: UserService,
        private readonly customerService: UserCustomerService,
        private readonly employeeService: UserEmployeeService,
    ) {}

    @Query(() => UserMe)
    @UseGuards(AuthenticationGuard)
    public me(@Context() context): UserMe {
        const user: UserEntity = context.req.user;

        return {
            id: user?.id,
            email: user?.email,
            mobile_phone: user?.mobile_phone,
            company: user?.profiles[0]?.company,
            first_name: user?.profiles[0]?.first_name,
            last_name: user?.profiles[0]?.last_name,
            job_title: user?.profiles[0]?.job_title,
            is_customer: user?.profiles[0]?.is_customer,
            avatar_url: user?.profiles[0]?.avatar_url,
        };
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async confirmPassword(@Context() context, @Args('password') password: string): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.checkPassword(password, user);
    }

    @Mutation(() => UserTokens)
    public async loginByEmail(@Args('data') data: UserLoginEmailInput): Promise<UserTokens> {
        return this.service.checkUserByEmail(data);
    }

    @Mutation(() => Boolean)
    public async loginByMobilePhone(@Args('data') data: UserLoginMobilePhoneInput): Promise<boolean> {
        return this.service.checkUserByMobilePhone(data);
    }

    @Mutation(() => UserTokens)
    public async loginByMobileCode(@Args('data') data: UserLoginMobileCodeInput): Promise<UserTokens> {
        return this.service.checkUserByMobileCode(data);
    }

    @Mutation(() => Boolean)
    public async recoverPassword(@Args('data') data: UserRecoverPasswordInput): Promise<boolean> {
        return this.service.recoverPassword(data);
    }

    @Mutation(() => Boolean)
    public async changePassword(@Args('data') data: UserChangePasswordInput): Promise<boolean> {
        return this.service.changePassword(data);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updatePassword(@Context() context, @Args('data') data: UserUpdatePasswordInput): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updatePassword(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateEmail(@Context() context, @Args('data') data: UserUpdateEmailInput): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updateEmail(data, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async updateMobilePhone(@Context() context, @Args('data') data: UserUpdateMobilePhoneInput): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.updateMobilePhone(data, user);
    }


    @Mutation(() => UserTokens)
    public async createUserCustomer(@Args('data') data: UserCustomerInput): Promise<UserTokens> {
        return this.customerService.createUserCustomer(data);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    @SetMetadata('roles', ['CUSTOMER'])
    public async createUserEmployee(@Args('data') data: UserEmployeeInput): Promise<boolean> {
        return this.employeeService.createUserEmployee(data);
    }

    @Mutation(() => UserTokens)
    public async emailConfirmation(@Context() context, @Args('code') code: string): Promise<UserTokens> {
        return this.service.emailConfirmation(code);
    }

    @Mutation(() => Boolean)
    public async resendEmailConfirmation(@Args('email') email: string): Promise<boolean> {
        return this.service.resendEmailConfirmation(email);
    }

    @Mutation(() => UserTokens)
    public async smsConfirmation(@Args('code') code: string): Promise<UserTokens> {
        return this.service.smsConfirmation(code);
    }

    @Mutation(() => Boolean)
    public async resendSmsConfirmation(@Args('mobile_phone') mobile_phone: string): Promise<boolean> {
        return this.service.resendSmsConfirmation(mobile_phone);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async checkPassword(@Context() context, @Args('password') password: string): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.service.checkPassword(password, user);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async removeEmployee(@Args('id') id: string): Promise<boolean> {
        return this.employeeService.removeEmployee(id);
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthenticationGuard)
    public async removeCustomer(@Context() context, @Args('password') password: string): Promise<boolean> {
        const user: UserEntity = context.req.user;

        return this.customerService.removeCustomer(password, user);
    }
}
