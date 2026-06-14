import { useDispatch, useSelector } from 'react-redux';
import ScrollbarsLib from 'react-custom-scrollbars-2';
const Scrollbars = (ScrollbarsLib as any).default ?? ScrollbarsLib;
import {
  selectDivisions,
  selectFilter,
  selectMerchant,
  selectSubcategories,
} from '../redux/selectors/selectors';
import { useGetAllProductsQuery } from '../api/storeApi';
import { FilterBar } from './FilterBar';
import { useEffect, useRef, useState } from 'react';
import { setCategories } from '../redux/features/categorySlice';
import { BounceLoader } from 'react-spinners';
import { setFilter, setDivision } from '../redux/features/filterSlice';
import { ProductCard } from './ProductCard';
import { setDivisions, setSubcategories } from '../redux/features/subcategoriesSlice';
import { ThumbVertical } from './ThumbVertical';
import { TrackVertical } from './TrackVertical';
import { EmptyProductsList } from './EmptyProductsList';
import { NoProductsFound } from './NoProductsFound';
import { DivisionsMap, DivisionData, ProductCategory, ProductSubcategory } from '../types';

export const Products = () => {
  const currentFilter = useSelector(selectFilter);
  const subcategories = useSelector(selectSubcategories) as Record<number, ProductSubcategory[]>;
  const merchantData = useSelector(selectMerchant);

  const [isSubcategoryVisible, setIsSubcategoryVisible] = useState(false);
  const [showDivisionFilter, setShowDivisionFilter] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(1575);
  const [showNoProductsMsg, setShowNoProductsMsg] = useState(false);
  const availableDivisions = useSelector(selectDivisions) as DivisionsMap;
  const subcategoriesRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<any>(null);

  const { isLoading, isFetching, isError, data, currentData } = useGetAllProductsQuery({
    filter: currentFilter.category,
    subcategory: currentFilter.subcategory,
    division: currentFilter.division,
  });

  const dispatch = useDispatch();

  type CategoryItem = { Categories: ProductCategory & { category_priority: number }; divisionData: DivisionData[] };

  const transformData = (rawData: Array<{ product_subcategory: number; Subcategories: ProductSubcategory }>) => {
    return rawData.reduce<Record<number, ProductSubcategory[]>>((acc, item) => {
      const categoryRef = item.Subcategories.category_ref_1C;
      const allInOneRef = 9999;

      if (!acc[allInOneRef]) acc[allInOneRef] = [];
      acc[allInOneRef].push({ ...item.Subcategories, product_subcategory: item.product_subcategory });

      if (!acc[categoryRef]) acc[categoryRef] = [];
      acc[categoryRef].push({ ...item.Subcategories, product_subcategory: item.product_subcategory });

      return acc;
    }, {});
  };

  const transformDivisions = (rawCategories: CategoryItem[]) => {
    if (!rawCategories) return {};
    return rawCategories.reduce<DivisionsMap>((acc, item) => {
      const category = item.Categories.cat_1C_id;
      const division = [...item.divisionData].sort((a, b) => (a.product_division ?? 0) - (b.product_division ?? 0));
      acc[category] = { division };
      return acc;
    }, {});
  };

  useEffect(() => {
    if (isError) {
      if (!data) setShowNoProductsMsg(true);
      return;
    }
    if (currentData?.status === 'ok') {
      setShowNoProductsMsg(false);
      const categories = currentData.categories ?? [];
      const sortedCategories = [...categories].sort(
        (a, b) => a.Categories.category_priority - b.Categories.category_priority
      );
      if (categories.length) dispatch(setCategories(sortedCategories));
    }
  }, [currentData, isError, data]);

  useEffect(() => {
    if (currentData?.status === 'ok' && currentFilter.category === 0) {
      dispatch(setSubcategories(transformData(currentData.subcategories ?? [])));
      dispatch(setDivisions(transformDivisions(currentData.categories ?? [])));
    }
  }, [currentData, currentFilter.category]);

  useEffect(() => {
    setIsSubcategoryVisible(currentFilter.category !== 0 && currentFilter.category !== 9999);
  }, [currentFilter.category]);

  useEffect(() => {
    const subcategoriesHeight = subcategoriesRef.current?.offsetHeight ?? 0;
    setScrollHeight(1495 - subcategoriesHeight);
  }, [isSubcategoryVisible, subcategoriesRef.current?.offsetHeight, currentFilter.category]);

  const subcategoryFilterHandler = (subcat: { product_subcategory: number }) => {
    dispatch(setFilter({ name: currentFilter.name, category: currentFilter.category, subcategory: subcat.product_subcategory, division: currentFilter.division, categoryName: currentFilter.categoryName }));
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (scrollRef.current) (scrollRef.current as any).update();
  }, [scrollHeight]);

  useEffect(() => {
    const divForCategory = (availableDivisions as DivisionsMap)[currentFilter.category];
    setShowDivisionFilter(!!(divForCategory && divForCategory.division?.length > 1));
  }, [availableDivisions, currentFilter.category]);

  return (
    <div className="products-container">
      <div className="circle-800 circle-635" />
      {isLoading && (
        <div className="loader-wrapper">
          <BounceLoader size={350} color="#FF6A14" />
          <div className="loader-text-wrap">
            <h1 className="loader-text">Завантаження...</h1>
          </div>
        </div>
      )}
      {isError && !data && <EmptyProductsList />}
      {data && (
        <div className="main-wrapper">
          <div className="sidebar">
            <FilterBar hasNewProducts={data.hasNewProducts ?? false} />
          </div>
          <div className="main-content">
            {currentFilter.category !== 0 && currentFilter.category !== 9999 && (
              <div className="subcategories-wrapper" ref={subcategoriesRef}>
                {showDivisionFilter && (
                  <div className="subcategories-grid divisions-grid">
                    {(availableDivisions as DivisionsMap)[currentFilter.category]?.division.filter((division) => division.ProductsDivisions != null).map((division) => (
                      <div className="subcategory-radio-wrapper division-radio-wrapper" key={division.ProductsDivisions.division_custom_id}>
                        <input
                          type="radio"
                          name="product-divisions"
                          id={division.ProductsDivisions.division_name}
                          className="subcat-filter-radio division-filter-radio"
                          value={division.ProductsDivisions.division_custom_id}
                          onChange={() => dispatch(setDivision(division.ProductsDivisions.division_custom_id))}
                          checked={currentFilter.division === division.ProductsDivisions.division_custom_id}
                        />
                        <label htmlFor={division.ProductsDivisions.division_name} className="subcat-filter-label division-filter-label">
                          {division.ProductsDivisions.division_name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                <div className="subcategories-grid">
                  <div className="subcategory-radio-wrapper">
                    <input type="checkbox" name="product-subcategories" id="all-subcat-filter" className="subcat-filter-radio" value="0" onChange={() => subcategoryFilterHandler({ product_subcategory: 0 })} checked={currentFilter.subcategory.includes(0)} />
                    <label htmlFor="all-subcat-filter" className="subcat-filter-label">Всі товари</label>
                  </div>
                  {(subcategories[currentFilter.category] ?? []).map((subcat) => (
                    <div className="subcategory-radio-wrapper" key={subcat.product_subcategory}>
                      <input type="checkbox" name="product-subcategories" id={subcat.subcategory_name} className="subcat-filter-radio" value={subcat.product_subcategory} onChange={() => subcategoryFilterHandler(subcat)} checked={currentFilter.subcategory.includes(subcat.product_subcategory)} />
                      <label htmlFor={subcat.subcategory_name} className="subcat-filter-label">{subcat.subcategory_name}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.status === 'none' ? (
              <NoProductsFound />
            ) : (
              <Scrollbars
                ref={scrollRef}
                renderTrackVertical={TrackVertical}
                renderThumbVertical={(props) => ThumbVertical(props as Record<string, unknown>, scrollRef as never)}
                style={{ width: 740 }}
                thumbSize={190}
                autoHeight
                autoHeightMin={400}
                autoHeightMax={scrollHeight}
                hideTracksWhenNotNeeded={true}
              >
                <div className="products-grid">
                  {showNoProductsMsg ? (
                    <EmptyProductsList />
                  ) : (
                    (data.products ?? []).map((el) => (
                      <ProductCard
                        key={el.id}
                        product={el}
                        useVATbyDefault={merchantData.useVATbyDefault}
                        isSingleMerchant={merchantData.isSingleMerchant}
                      />
                    ))
                  )}
                </div>
              </Scrollbars>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
