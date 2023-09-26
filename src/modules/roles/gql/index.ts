import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Role {
    @Field() id: string;
    @Field() name: string;
}

@InputType()
export class CreateRoleInput {
    @Field() name: string;
}
