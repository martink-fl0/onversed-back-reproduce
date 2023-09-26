import { InputType, Field } from '@nestjs/graphql';

import {
    IsEmail,
    MinLength,
    Matches,
    IsOptional,
    ValidatorConstraint,
    ValidatorConstraintInterface, ValidationArguments, Validate
} from 'class-validator';


@ValidatorConstraint({ name: 'MobilePhoneFormat', async: false })
export class MobilePhoneFormatValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        // Verificar si se proporciona un valor para el campo mobile_phone
        if (value) {
            // Realizar la validación de formato solo si se proporciona un valor
            const pattern = /^\+(?:[0-9] ?){6,14}[0-9]$/;
            return !!value.match(pattern);
        }
        // Permitir pasar la validación si no se proporciona un valor
        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return args.constraints[0];
    }
}

@InputType()
export class UserCustomerInput {
    @Field() lang: string;

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

    @Field() last_name: string;
    @Field() first_name: string;

    @Field({ nullable: true })
    @Validate(MobilePhoneFormatValidator, {
        message: '@ErrorMobilePhoneFormat',
    })
        mobile_phone?: string;

    @Field() company_name: string;
}
