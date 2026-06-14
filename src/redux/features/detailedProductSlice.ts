import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartProduct } from '../../types';

const detailedProductSlice = createSlice({
  name: 'detailedProduct',
  initialState: {} as Partial<CartProduct>,
  reducers: {
    addDetailedProduct: (_state, action: PayloadAction<CartProduct>) => {
      return action.payload;
    },
    clearDetailedProduct: () => ({}),
  },
});

export const { addDetailedProduct, clearDetailedProduct } = detailedProductSlice.actions;
export default detailedProductSlice.reducer;
