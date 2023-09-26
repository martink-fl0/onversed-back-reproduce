import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VItemCountryStandardEntity } from "../../../entities/_item-country-standard.entity";
import { VItemCategoryEntity } from "../../../entities/_item-category.entity";
import { VItemUseEntity } from "../../../entities/_item-use.entity";

@Injectable()
export class ItemCountryStandardSeeder {
    constructor(
        @InjectRepository(VItemCountryStandardEntity)
        private readonly repository: Repository<VItemCountryStandardEntity>,

        @InjectRepository(VItemCategoryEntity)
        private readonly categoryRepository: Repository<VItemCategoryEntity>,

        @InjectRepository(VItemUseEntity)
        private readonly useRepository: Repository<VItemUseEntity>,
    ) {}

    public async seed(): Promise<void> {
        const count = await this.repository.count();

        if (count) {
            return;
        }

        const factory: VItemUseEntity = await this.useRepository.findOne({ where: { name: 'factory' } });

        const uses: VItemUseEntity[] = [factory];

        const us: VItemCountryStandardEntity = this.repository.create({ name: 'us', label: 'US', uses });
        const eu: VItemCountryStandardEntity = this.repository.create({ name: 'eu', label: 'EU', uses });
        const it: VItemCountryStandardEntity = this.repository.create({ name: 'it', label: 'IT', uses });
        const uk: VItemCountryStandardEntity = this.repository.create({ name: 'uk', label: 'UK', uses });
        const mex: VItemCountryStandardEntity = this.repository.create({ name: 'mx', label: 'MX', uses });

        await this.repository.save([us, eu, it, uk, mex]);
    }
}
