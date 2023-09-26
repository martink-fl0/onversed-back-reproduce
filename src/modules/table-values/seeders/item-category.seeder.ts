import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemCategoryEntity } from 'src/entities/_item-category.entity';
import { VItemUseEntity } from "../../../entities/_item-use.entity";
import { VItemSizeEntity } from "../../../entities/_item-size.entity";

@Injectable()
export class ItemCategorySeeder {
    constructor(
        @InjectRepository(VItemCategoryEntity)
        private readonly repository: Repository<VItemCategoryEntity>,

        @InjectRepository(VItemUseEntity)
        private readonly useRepository: Repository<VItemUseEntity>,

        @InjectRepository(VItemSizeEntity)
        private readonly sizeRepository: Repository<VItemSizeEntity>,
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

        const complete_uses: VItemUseEntity[] = [factory];
        const simple_uses: VItemUseEntity[] = [asset, zepeto, roblox, spatial, decentraland];

        const baby_6: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_6' } });
        const baby_9: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_9' } });
        const baby_12: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_12' } });
        const baby_18: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_18' } });
        const baby_24: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_24' } });
        const baby_30: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_30' } });
        const baby_36: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'baby_36' } });

        const child_2: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_2' } });
        const child_4: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_4' } });
        const child_6: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_6' } });
        const child_8: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_8' } });
        const child_10: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_10' } });
        const child_12: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_12' } });
        const child_14: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'child_14' } });

        const s: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 's' } });
        const m: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'm' } });
        const l: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'l' } });
        const xs: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'xs' } });
        const xl: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'xl' } });
        const xxl: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'xxl' } });

        const other: VItemSizeEntity = await this.sizeRepository.findOne({ where: { name: 'other' } });

        const adult_sizes: VItemSizeEntity[] = [xs, s, m, l, xl, xxl, other];
        const baby_sizes: VItemSizeEntity[] = [baby_6, baby_9, baby_12, baby_18, baby_24, baby_30, baby_36, other];
        const child_sizes: VItemSizeEntity[] = [child_2, child_4, child_6, child_8, child_10, child_12, child_14, other];

        const simple_feminine: VItemCategoryEntity = this.repository.create({
            name: 'simple_feminine',
            label: 'Feminine',
            uses: simple_uses,
        });

        const simple_masculine: VItemCategoryEntity = this.repository.create({
            name: 'simple_masculine',
            label: 'Masculine',
            uses: simple_uses,
        });

        const simple_maternity: VItemCategoryEntity = this.repository.create({
            name: 'simple_maternity',
            label: 'Maternity',
            uses: simple_uses,
        });

        const simple_unisex: VItemCategoryEntity = this.repository.create({
            name: 'simple_unisex',
            label: 'Unisex',
            uses: simple_uses,
        });

        const simple_boy: VItemCategoryEntity = this.repository.create({
            name: 'simple_boy',
            label: 'Boy',
            uses: simple_uses,
        });

        const simple_girl: VItemCategoryEntity = this.repository.create({
            name: 'simple_girl',
            label: 'Girl',
            uses: simple_uses,
        });

        const simple_baby_boy: VItemCategoryEntity = this.repository.create({
            name: 'simple_baby_boy',
            label: 'Baby Boy',
            uses: simple_uses,
        });

        const simple_baby_girl: VItemCategoryEntity = this.repository.create({
            name: 'simple_baby_girl',
            label: 'Baby Girl',
            uses: simple_uses,
        });

        const complete_feminine: VItemCategoryEntity = this.repository.create({
            name: 'complete_feminine',
            label: 'Feminine',
            uses: complete_uses,
            sizes: adult_sizes,
        });

        const complete_masculine: VItemCategoryEntity = this.repository.create({
            name: 'complete_masculine',
            label: 'Masculine',
            uses: complete_uses,
            sizes: adult_sizes,
        });

        const complete_maternity: VItemCategoryEntity = this.repository.create({
            name: 'complete_maternity',
            label: 'Maternity',
            uses: complete_uses,
            sizes: adult_sizes,
        });

        const complete_unisex: VItemCategoryEntity = this.repository.create({
            name: 'complete_unisex',
            label: 'Unisex',
            uses: complete_uses,
            sizes: adult_sizes,
        });

        const complete_boy: VItemCategoryEntity = this.repository.create({
            name: 'complete_boy',
            label: 'Boy',
            uses: complete_uses,
            sizes: child_sizes,
        });

        const complete_girl: VItemCategoryEntity = this.repository.create({
            name: 'complete_girl',
            label: 'Girl',
            uses: complete_uses,
            sizes: child_sizes,
        });

        const complete_baby_boy: VItemCategoryEntity = this.repository.create({
            name: 'complete_baby_boy',
            label: 'Baby Boy',
            uses: complete_uses,
            sizes: baby_sizes,
        });

        const complete_baby_girl: VItemCategoryEntity = this.repository.create({
            name: 'complete_baby_girl',
            label: 'Baby Girl',
            uses: complete_uses,
            sizes: baby_sizes,
        });

        await this.repository.save([
            simple_unisex,
            simple_feminine,
            simple_masculine,
            simple_maternity,

            simple_boy,
            simple_girl,

            simple_baby_boy,
            simple_baby_girl,

            complete_unisex,
            complete_feminine,
            complete_masculine,
            complete_maternity,

            complete_boy,
            complete_girl,

            complete_baby_boy,
            complete_baby_girl,
        ]);
    }
}
