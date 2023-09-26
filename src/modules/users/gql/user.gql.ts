import { IsEmail, Matches, MinLength } from 'class-validator';
import { InputType, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserLoginEmailInput {
    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        email: string;

    @Field()
    @MinLength(8, { message: '@ErrorMinLength' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            '@ErrorPasswordFormat',
    })
        password: string;
}

@InputType()
export class UserLoginMobilePhoneInput {
    @Field()
    @Matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, {
        message: '@ErrorMobilePhoneFormat',
    })
        mobile_phone: string;
}
@InputType()
export class UserLoginMobileCodeInput {
    @Field() code: string;

    @Field()
    @Matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, {
        message: '@ErrorMobilePhoneFormat',
    })
        mobile_phone: string;
}

@InputType()
export class UserRecoverPasswordInput {
    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        email: string;
}

@InputType()
export class UserChangePasswordInput {
    @Field() code: string;

    @Field()
    @MinLength(8, { message: '@ErrorMinLength' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            '@ErrorPasswordFormat',
    })
        password: string;
}

@InputType()
export class UserUpdatePasswordInput {
    @Field()
    @MinLength(8, { message: '@ErrorMinLength' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            '@ErrorPasswordFormat',
    })
        new_password: string;

    @Field()
    @MinLength(8, { message: '@ErrorMinLength' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, {
        message:
            '@ErrorPasswordFormat',
    })
        current_password: string;
}

@InputType()
export class UserUpdateMobilePhoneInput {
    @Field()
    @Matches(/^\+(?:[0-9] ?){6,14}[0-9]$/, {
        message: '@ErrorMobilePhoneFormat',
    })
        new_mobile_phone: string;

    @Field({ nullable: true })
        current_mobile_phone: string;

    @Field()
        code: string;
}

@InputType()
export class UserUpdateEmailInput {
    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        new_email: string;

    @Field()
    @IsEmail({}, { message: '@ErrorEmailFormat' })
        current_email: string;

    @Field()
        code: string;
}

@ObjectType()
class UserMeCompany {
    @Field() id: string;
    @Field() name: string;
}

@ObjectType()
export class UserMe {
    @Field() id: string;
    @Field() email: string;
    @Field() last_name: string;
    @Field() first_name: string;
    @Field() is_customer: boolean;
    @Field() mobile_phone: string;
    @Field({ nullable: true }) avatar_url: string;
    @Field({ nullable: true }) job_title: string;
    @Field({ nullable: true }) company: UserMeCompany;
}
