import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuyStatusState } from '../../types';

const initialState: BuyStatusState = {
  status: null,
  message: '',
  paymentCount: 1,
};

const buyStatusSlice = createSlice({
  name: 'buyStatus',
  initialState,
  reducers: {
    setBuyStatus: (_state, action: PayloadAction<Partial<BuyStatusState>>) => {
      return { ...initialState, ...action.payload };
    },
    clearBuyStatus: () => ({ status: null, message: '', paymentCount: 1 }),
    setPaymentCount: (state, action: PayloadAction<number>) => {
      state.paymentCount = action.payload;
    },
    clearPaymentCount: (state) => {
      state.paymentCount = 1;
    },
  },
});

export const { setBuyStatus, clearBuyStatus, setPaymentCount, clearPaymentCount } =
  buyStatusSlice.actions;

export default buyStatusSlice.reducer;
