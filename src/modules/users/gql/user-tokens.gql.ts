import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserTokens {
    @Field() accessToken: string;
    @Field() refreshToken: string;

    @Field() mobile_phone: string;

    @Field() is_confirmed: boolean;
    @Field() has_mobile_phone: boolean;
}
