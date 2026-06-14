import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, SearchState } from '../../types';

const initialState: SearchState = {
  searchQuery: '',
  searchResults: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Product[]>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const { setSearch, setSearchResults, clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
