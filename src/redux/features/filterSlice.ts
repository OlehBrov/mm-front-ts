import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState } from '../../types';

const initialState: FilterState = {
  name: 'all',
  category: 0,
  subcategory: [0],
  categoryName: '',
  division: 0,
};

interface SetFilterPayload {
  name: string;
  category: number;
  subcategory: number;
  categoryName: string;
  division?: number;
}

const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<SetFilterPayload>) => {
      const { name, category, subcategory, categoryName, division = 0 } = action.payload;

      if (subcategory === 0) {
        return { ...state, name, category, subcategory: [0], categoryName, division: 0 };
      }

      let updatedSubcategories = state.subcategory.filter((sc) => sc !== 0);
      const subcatIndex = updatedSubcategories.indexOf(subcategory);

      if (subcatIndex !== -1) {
        updatedSubcategories.splice(subcatIndex, 1);
      } else {
        updatedSubcategories.push(subcategory);
      }

      if (updatedSubcategories.length === 0) {
        updatedSubcategories = [0];
      }

      return { ...state, name, category, subcategory: updatedSubcategories, categoryName: name, division };
    },
    setDivision: (state, action: PayloadAction<number>) => {
      state.division = action.payload;
    },
    clearFilter: () => initialState,
  },
});

export const { setFilter, setDivision, clearFilter } = filterSlice.actions;
export default filterSlice.reducer;
