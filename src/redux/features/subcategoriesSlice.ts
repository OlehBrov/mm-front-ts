import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubcategoriesMap, DivisionsMap } from '../../types';

interface SubcategoriesState {
  subcategoryList: SubcategoriesMap;
  divisions: DivisionsMap | Array<{ div_id: number; division_custom_id: number; division_name: string }>;
}

const initialState: SubcategoriesState = {
  subcategoryList: {},
  divisions: [{ div_id: 8, division_custom_id: 0, division_name: 'no division' }],
};

const subcategoriesSlice = createSlice({
  name: 'subcategories',
  initialState,
  reducers: {
    setSubcategories: (state, action: PayloadAction<SubcategoriesMap>) => {
      state.subcategoryList = action.payload;
    },
    setDivisions: (state, action: PayloadAction<DivisionsMap>) => {
      state.divisions = action.payload;
    },
  },
});

export const { setSubcategories, setDivisions } = subcategoriesSlice.actions;
export default subcategoriesSlice.reducer;
