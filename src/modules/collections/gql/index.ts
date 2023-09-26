import * as Upload from 'graphql-upload/Upload.js';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';

import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { Blob } from '../../blobs/gql';
import { Item } from '../../items/gql';
import { Role } from "../../roles/gql";

@ObjectType()
class CollectionValue {
    @Field() id: string;
    @Field() name: string;
}

@ObjectType()
class CollectionProfile {
    @Field() first_name: string;
    @Field() last_name: string;

    @Field(() => CollectionValue) company: CollectionValue;
}

@ObjectType()
export class Designer {
    @Field() id: string;
    @Field() last_name: string;
    @Field() first_name: string;
    @Field({ nullable: true }) avatar_url: string;

    @Field(() => [Role]) roles: [Role];
}

@ObjectType()
export class CollectionActivity {
    @Field() id: string;
    @Field() type: number;
    @Field() created_at: string;
    @Field(() => CollectionProfile) profile: CollectionProfile;
    @Field(() => CollectionValue, { nullable: true }) item: CollectionValue;
    @Field(() => CollectionValue, { nullable: true }) collection: CollectionValue;
}

@ObjectType()
export class Collection {
    @Field() id: string;
    @Field() name: string;
    @Field() state: number;
    @Field() description: string;
    @Field() other_description: string;

    @Field() is_agreed: boolean;

    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_inherited: boolean;
    @Field() is_decentraland: boolean;

    @Field({ nullable: true }) nft_url: string;

    @Field() created_at: boolean;
    @Field() updated_at: boolean;

    @Field(() => [Blob]) blobs: Blob[];
    @Field(() => [Item], { nullable: true }) items: Item[];
    @Field(() => [Designer]) designers: Designer[];
    @Field(() => [CollectionActivity]) activities: CollectionActivity[];
}

@InputType()
export class CollectionCreationInput {
    @Field() name: string;
    @Field() description: string;
    @Field() other_description: string;

    @Field() is_agreed: boolean;

    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_inherited: boolean;
    @Field() is_decentraland: boolean;

    @Field({ nullable: true }) nft_url: string;

    @Field(() => [String]) designers: string[];

    @Field(() => GraphQLUpload)
        image?: Upload;
}

@InputType()
export class CollectionUpdateInput {
    @Field() name: string;
    @Field() description: string;
    @Field() other_description: string;

    @Field() is_assets: boolean;
    @Field() is_roblox: boolean;
    @Field() is_zepeto: boolean;
    @Field() is_factory: boolean;
    @Field() is_spatial: boolean;
    @Field() is_inherited: boolean;
    @Field() is_decentraland: boolean;

    @Field({ nullable: true }) nft_url: string;

    @Field(() => [String]) designers: string[];

    @Field(() => GraphQLUpload, { nullable: true })
        image?: Upload;
}

@InputType()
export class CollectionSearchInput {
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


@InputType()
export class CollectionSearchDesignerInput {
    @Field() name: string;
}
