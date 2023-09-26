import { Field, InputType, ObjectType } from '@nestjs/graphql';

// import { IsEmail, IsOptional, Matches } from 'class-validator';

@ObjectType()
export class Value {
    @Field({ nullable: true }) id: string;
    @Field({ nullable: true }) name: string;
    @Field({ nullable: true }) label: string;
}

@ObjectType()
export class Category {
    @Field({ nullable: true }) id: string;
    @Field({ nullable: true }) name: string;
    @Field({ nullable: true }) label: string;
    @Field(() => [Value], { nullable: true }) sizes: Value[];
}
@ObjectType()
export class TableValue {
    @Field({ nullable: true }) id: string;
    @Field({ nullable: true }) name: string;
    @Field({ nullable: true }) label: string;
    @Field(() => [Value], { nullable: true }) types: Value[];
    @Field(() => [Value], { nullable: true }) files: Value[];
    @Field(() => [Value], { nullable: true }) countries: Value[];
    @Field(() => [Category], { nullable: true }) categories: Category[];
}

@InputType()
export class TableValueInput {
    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_decentraland: boolean;
}
