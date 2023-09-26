import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemFileEntity } from "../../../entities/_item-file.entity";
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Injectable()
export class ItemFileSeeder {
    constructor(
        @InjectRepository(VItemFileEntity)
        private readonly repository: Repository<VItemFileEntity>,

        @InjectRepository(VItemUseEntity)
        private readonly useRepository: Repository<VItemUseEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count: number = await this.repository.count();

        if (count) {
            return;
        }

        const asset: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'asset' } });
        const zepeto: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'zepeto' } });
        const roblox: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'roblox' } });
        const factory: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'factory' } });
        const spatial: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'spatial' } });
        const decentraland: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'decentraland' } });

        const other: VItemFileEntity = this.repository.create({
            name: 'other',
            label: 'Other',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const logos: VItemFileEntity = this.repository.create({
            name: 'logos',
            label: 'Logos',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const photo_back: VItemFileEntity = this.repository.create({
            name: 'photo_back',
            label: 'Photo (Back)',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const photo_front: VItemFileEntity = this.repository.create({
            name: 'photo_front',
            label: 'Photo (Front)',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const other_images: VItemFileEntity = this.repository.create({
            name: 'other_images',
            label: 'Other Images',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const additional_docs: VItemFileEntity = this.repository.create({
            name: 'additional_docs',
            label: 'Additional Docs',
            uses: [asset, zepeto, roblox, factory, spatial, decentraland],
        });

        const technical_sheet: VItemFileEntity = this.repository.create({
            name: 'technical_sheet',
            label: 'Technical Sheet',
            uses: [factory],
        });

        const technical_drawing: VItemFileEntity = this.repository.create({
            name: 'technical_drawing',
            label: 'Technical Drawing',
            uses: [factory],
        });

        await this.repository.save([
            other,
            logos,
            photo_back,
            photo_front,
            other_images,
            additional_docs,
            technical_sheet,
            technical_drawing,
        ]);
    }
}
