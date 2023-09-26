import { VItemTypeEntity } from "../../../entities/_item-type.entity";
import { VItemSizeEntity } from "../../../entities/_item-size.entity";
import { CollectionEntity } from "../../../entities/collection.entity";
import { VItemCategoryEntity } from "../../../entities/_item-category.entity";
import { VItemCountryStandardEntity } from "../../../entities/_item-country-standard.entity";

export type TItemRelationData = {
    type: VItemTypeEntity;
    size: VItemSizeEntity;
    collection: CollectionEntity;
    category: VItemCategoryEntity;
    country_standard: VItemCountryStandardEntity;
}
