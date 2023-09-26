import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemTypeEntity } from "../../../entities/_item-type.entity";
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Injectable()
export class ItemTypeSeeder {
    constructor(
        @InjectRepository(VItemTypeEntity)
        private readonly repository: Repository<VItemTypeEntity>,

        @InjectRepository(VItemUseEntity)
        private readonly useRepository: Repository<VItemUseEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count = await this.repository.count();

        if (count) {
            return;
        }

        const asset: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'asset' } });
        const zepeto: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'zepeto' } });
        const roblox: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'roblox' } });
        const factory: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'factory' } });
        const spatial: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'spatial' } });
        const decentraland: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'decentraland' } });

        const uses: VItemUseEntity[] = [asset, zepeto, roblox, factory, spatial, decentraland];

        const coat: VItemTypeEntity = this.repository.create({ name: 'coat', label: 'Coat', uses });
        const other: VItemTypeEntity = this.repository.create({ name: 'other', label: 'Other', uses });
        const dress: VItemTypeEntity = this.repository.create({ name: 'dress', label: 'Dress', uses });
        const shirt: VItemTypeEntity = this.repository.create({ name: 'shirt', label: 'Shirt', uses });
        const blouse: VItemTypeEntity = this.repository.create({ name: 'blouse', label: 'Blouse', uses });
        const hoodie: VItemTypeEntity = this.repository.create({ name: 'hoodie', label: 'Hoodie', uses });
        const jacket: VItemTypeEntity = this.repository.create({ name: 'jacket', label: 'Jacket', uses });
        const sweater: VItemTypeEntity = this.repository.create({ name: 'sweater', label: 'Sweater', uses });
        const t_shirt: VItemTypeEntity = this.repository.create({ name: 't_shirt', label: 'T-Shirt', uses });
        const swimsuit: VItemTypeEntity = this.repository.create({ name: 'swimsuit', label: 'Swimsuit', uses });
        const trousers: VItemTypeEntity = this.repository.create({ name: 'trousers', label: 'Trousers', uses });
        const cardigan: VItemTypeEntity = this.repository.create({ name: 'cardigan', label: 'Cardigan', uses });
        const waist_coat: VItemTypeEntity = this.repository.create({ name: 'waist_coat', label: 'Waistcoat', uses });
        const polo_shirt: VItemTypeEntity = this.repository.create({ name: 'polo_shirt', label: 'Polo Shirt', uses });
        const trench_coat: VItemTypeEntity = this.repository.create({ name: 'trench_coat', label: 'Trench Coat', uses });

        await this.repository.save([
            coat,
            other,
            dress,
            shirt,
            blouse,
            hoodie,
            jacket,
            t_shirt,
            sweater,
            cardigan,
            swimsuit,
            trousers,
            polo_shirt,
            waist_coat,
            trench_coat,
        ]);
    }
}
