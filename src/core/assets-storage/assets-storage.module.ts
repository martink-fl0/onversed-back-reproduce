import { Module } from '@nestjs/common';

import { AssetsStorageService } from './services';

@Module({
    providers: [
        AssetsStorageService,
    ],
    exports: [
        AssetsStorageService,
    ]
})

export class AssetsStorageModule {}
