import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../../types';

interface CategoryPayloadItem {
  Categories: {
    cat_1C_id: number;
    category_name: string;
    category_image: string;
    category_priority: number;
  };
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: [] as Category[],
  reducers: {
    setCategories: (_state, action: PayloadAction<CategoryPayloadItem[]>) => {
      return action.payload.map((item) => ({
        categoryId: item.Categories.cat_1C_id,
        categoryName: item.Categories.category_name,
        categoryImage: item.Categories.category_image,
      }));
    },
  },
});

export const { setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
