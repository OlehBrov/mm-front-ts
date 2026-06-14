import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MerchantData } from '../../types';

const initialState: MerchantData = {
  defaultMerchant: '',
  isSingleMerchant: false,
  status: '',
  useVATbyDefault: false,
  vatExciseMerchant: '',
  noVATTaxGroup: 0,
  VATTaxGroup: 0,
  VATExciseTaxGroup: 0,
};

const merchantsSlice = createSlice({
  name: 'merchant',
  initialState,
  reducers: {
    setMerchantsData: (_state, action: PayloadAction<MerchantData>) => {
      return action.payload;
    },
    clearMerchantsData: () => initialState,
  },
});

export const { setMerchantsData, clearMerchantsData } = merchantsSlice.actions;
export default merchantsSlice.reducer;
