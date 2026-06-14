import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const recieptSlice = createSlice({
  name: 'reciept',
  initialState: {} as Record<string, unknown>,
  reducers: {
    setReciept: (_state, action: PayloadAction<Record<string, unknown>>) => {
      return action.payload;
    },
    clearReciept: () => ({}),
    // Merges incoming fiscal keys (fiscalNoVAT, fiscalWithVAT) into fiscalResponse.
    // Called when the backend emits 'receipt-ready' via WebSocket after async fiscal processing.
    updateFiscal: (state, action: PayloadAction<Record<string, unknown>>) => {
      const existing = state as Record<string, unknown>;
      const prev = (existing.fiscalResponse as Record<string, unknown>) ?? {};
      return { ...existing, fiscalResponse: { ...prev, ...action.payload } };
    },
  },
});

export const { setReciept, clearReciept, updateFiscal } = recieptSlice.actions;
export default recieptSlice.reducer;
