import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { EActivityState } from "../../../entities/activity.entity";

@ObjectType()
export class ActivityCollection {
    @Field() id: string;
    @Field() name: string;
    @Field() description: string;
}

@ObjectType()
export class Activity {
    @Field() id: string;
    @Field() type: string;
    @Field() item: string;
    @Field() profile: string;

    @Field(() => ActivityCollection, { nullable: true })
        collection: ActivityCollection;
}

@InputType()
export class ActivityInput {
    @Field({ nullable: true }) item: string;
    @Field({ nullable: true }) collection: string;
    @Field({ nullable: true }) type: EActivityState;

    @Field({ nullable: true }) limit: number;
    @Field({ nullable: true }) offset: number;
}
