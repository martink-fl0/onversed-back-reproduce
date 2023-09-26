import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Role } from '../../roles/gql';
import { IsEmail, IsOptional, Matches } from 'class-validator';

@ObjectType()
export class ProfileCompany {
    @Field() id: string;
    @Field() name: string;
}

@ObjectType()
export class ProfileTeam {
    @Field() id: string;
    @Field() email: string;
    @Field() last_name: string;
    @Field() first_name: string;
    @Field() is_active: boolean;
    @Field() mobile_phone: string;
    @Field({ nullable: true }) job_title: string;

    @Field(() => ProfileCompany)
        company: ProfileCompany;

    @Field(() => [Role])
        roles: [Role];
}

@InputType()
export class UpdateEmployeeProfileInput {
    @Field() id: string;
    @Field() lang: string;

    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        email: string;

    @Field() role: string;
    @Field() job_title: string;
    @Field() last_name: string;
    @Field() first_name: string;

    @Field()
    @Matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, {
        message: '@ErrorMobilePhoneFormat',
    })
    @IsOptional()
        mobile_phone: string;

    @Field() company_id: string;
}

@InputType()
export class UpdateCustomerProfileInput {
    @Field() first_name: string;
    @Field() last_name: string;
    @Field({ nullable: true }) job_title: string;
}
