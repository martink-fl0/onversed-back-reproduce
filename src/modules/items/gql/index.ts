import * as Upload from 'graphql-upload/Upload.js';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Blob } from '../../blobs/gql';

@ObjectType()
export class Item {
    @Field() id: string;
    @Field() sku: string;
    @Field() name: string;
    @Field() state: string;
    @Field() nft_url: string;
    @Field() description: string;

    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_decentraland: boolean;

    @Field(() => [Blob], { nullable: true }) blobs: Blob[];
}


@InputType()
export class ItemImage {
    @Field() type: number;

    @Field(() => [GraphQLUpload])
        images?: [Upload];
}

@InputType()
export class ItemCreationInput {
    @Field() sku: string;
    @Field() name: string;
    @Field() nft_url: string;
    @Field() description: string;


    @Field() type: string;
    @Field() category: string;
    @Field({ nullable: true }) size: string;
    @Field({ nullable: true }) to_sent: boolean;
    @Field({ nullable: true }) country_standard: string;


    @Field({ nullable: true }) is_assets: boolean;
    @Field({ nullable: true }) is_roblox: boolean;
    @Field({ nullable: true }) is_zepeto: boolean;
    @Field({ nullable: true }) is_factory: boolean;
    @Field({ nullable: true }) is_spatial: boolean;
    @Field({ nullable: true }) is_decentraland: boolean;

    @Field(() => [ItemImage]) blobs?: ItemImage[];
}

@InputType()
export class ItemUpdateInput {
    @Field() sku: string;
    @Field() name: string;
    @Field() description: string;
    @Field() nft_url: string;

    @Field() to_sent: boolean;

    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_decentraland: boolean;

    @Field(() => [GraphQLUpload])
        images?: [Upload];
}

@InputType()
export class ItemSearchInput {
    @Field({ nullable: true }) name: string;
    @Field({ nullable: true }) state: number;
    @Field({ nullable: true }) designer: string;

    @Field({ nullable: true }) is_assets: boolean;
    @Field({ nullable: true }) is_roblox: boolean;
    @Field({ nullable: true }) is_zepeto: boolean;
    @Field({ nullable: true }) is_factory: boolean;
    @Field({ nullable: true }) is_spatial: boolean;
    @Field({ nullable: true }) is_decentraland: boolean;

    @Field({ nullable: true }) end_at: string;
    @Field({ nullable: true }) start_at: string;

    @Field({ nullable: true }) sort_by: string;
    @Field({ nullable: true }) sort_direction: string;

    @Field({ nullable: true }) limit: number;
    @Field({ nullable: true }) offset: number;
}
