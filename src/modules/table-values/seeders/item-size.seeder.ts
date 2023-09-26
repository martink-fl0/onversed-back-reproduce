import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemSizeEntity } from "../../../entities/_item-size.entity";

@Injectable()
export class ItemSizeSeeder {
    constructor(
        @InjectRepository(VItemSizeEntity)
        private readonly repository: Repository<VItemSizeEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count = await this.repository.count();

        if (count) {
            return;
        }

        const child_2: VItemSizeEntity = this.repository.create({ name: 'child_2', label: '2' });
        const child_4: VItemSizeEntity = this.repository.create({ name: 'child_4', label: '4' });
        const child_6: VItemSizeEntity = this.repository.create({ name: 'child_6', label: '6' });
        const child_8: VItemSizeEntity = this.repository.create({ name: 'child_8', label: '8' });
        const child_10: VItemSizeEntity = this.repository.create({ name: 'child_10', label: '10' });
        const child_12: VItemSizeEntity = this.repository.create({ name: 'child_12', label: '12' });
        const child_14: VItemSizeEntity = this.repository.create({ name: 'child_14', label: '14' });

        const baby_6: VItemSizeEntity = this.repository.create({ name: 'baby_6', label: '6 Month' });
        const baby_9: VItemSizeEntity = this.repository.create({ name: 'baby_9', label: '9 Month' });
        const baby_12: VItemSizeEntity = this.repository.create({ name: 'baby_12', label: '12 Month' });
        const baby_18: VItemSizeEntity = this.repository.create({ name: 'baby_18', label: '18 Month' });
        const baby_24: VItemSizeEntity = this.repository.create({ name: 'baby_24', label: '24 Month' });
        const baby_30: VItemSizeEntity = this.repository.create({ name: 'baby_30', label: '30 Month' });
        const baby_36: VItemSizeEntity = this.repository.create({ name: 'baby_36', label: '36 Month' });

        const xs: VItemSizeEntity = this.repository.create({ name: 'xs', label: 'XS' });
        const s: VItemSizeEntity = this.repository.create({ name: 's', label: 'S' });
        const m: VItemSizeEntity = this.repository.create({ name: 'm', label: 'M' });
        const l: VItemSizeEntity = this.repository.create({ name: 'l', label: 'L' });
        const xl: VItemSizeEntity = this.repository.create({ name: 'xl', label: 'XL' });
        const xxl: VItemSizeEntity = this.repository.create({ name: 'xxl', label: 'XXL' });

        const other: VItemSizeEntity = this.repository.create({ name: 'other', label: 'Other' });

        await this.repository.save([
            child_2,
            child_4,
            child_6,
            child_8,
            child_10,
            child_12,
            child_14,

            baby_6,
            baby_9,
            baby_12,
            baby_18,
            baby_24,
            baby_30,
            baby_36,

            s,
            m,
            l,
            xs,
            xl,
            xxl,

            other,
        ]);
    }
}
