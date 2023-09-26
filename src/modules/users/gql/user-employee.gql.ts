import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, Matches } from 'class-validator';

@InputType()
export class UserEmployeeInput {
    @Field() lang: string;

    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        email: string;

    @Field() role: string;
    @Field() job_title: string;
    @Field() last_name: string;
    @Field() first_name: string;
    @Field() company_id: string;

    @Field()
    @Matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, {
        message: '@ErrorMobilePhoneFormat',
    })
    @IsOptional()
        mobile_phone: string;
}
