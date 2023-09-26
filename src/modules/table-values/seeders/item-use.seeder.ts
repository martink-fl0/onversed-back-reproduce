import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Injectable()
export class ItemUseSeeder {
    constructor(
        @InjectRepository(VItemUseEntity)
        private readonly repository: Repository<VItemUseEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count = await this.repository.count();

        if (count) {
            return;
        }

        const other: VItemUseEntity = this.repository.create({ name: 'other', label: 'Other' });
        const asset: VItemUseEntity = this.repository.create({ name: 'asset', label: '3D Asset' });
        const zepeto: VItemUseEntity = this.repository.create({ name: 'zepeto', label: '3D Asset for Zepeto' });
        const roblox: VItemUseEntity = this.repository.create({ name: 'roblox', label: '3D Asset for Roblox' });
        const factory: VItemUseEntity = this.repository.create({ name: 'factory', label: '3D Asset for Factory' });
        const spatial: VItemUseEntity = this.repository.create({ name: 'spatial', label: '3D Asset for Spatial' });
        const decentraland: VItemUseEntity = this.repository.create({ name: 'decentraland', label: '3D Asset for Decentralan' });

        await this.repository.save([
            other,
            asset,
            zepeto,
            roblox,
            factory,
            spatial,
            decentraland,
        ]);
    }
}
