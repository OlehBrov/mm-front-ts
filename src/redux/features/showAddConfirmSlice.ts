import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShowAddConfirmState } from '../../types';

const initialState: ShowAddConfirmState = {
  show: false,
  product: null,
  isSuccess: false,
  message: '',
};

const showAddConfirmSlice = createSlice({
  name: 'showAddConfirm',
  initialState,
  reducers: {
    setShowAddProductsConfirm: (_state, action: PayloadAction<ShowAddConfirmState>) => {
      return action.payload;
    },
  },
});

export const { setShowAddProductsConfirm } = showAddConfirmSlice.actions;
export default showAddConfirmSlice.reducer;
