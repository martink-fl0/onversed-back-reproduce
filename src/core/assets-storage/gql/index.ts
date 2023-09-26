import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class AssetsStorageUploadInput {
    @Field() filename: string;
    @Field() mimetype: string;
    @Field() encoding: string;

    @Field() buffer: Buffer;
}

@ObjectType()
export class AssetsStorageUploadResponse {
    @Field() message: string;
    @Field() requestId: string;
}
