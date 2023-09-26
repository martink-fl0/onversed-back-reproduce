import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Blob {
    @Field() id: string;
    @Field() name: string;
    @Field() type: string;
    @Field() size: string;
    @Field() url: string;
    @Field() mime: string;
}
