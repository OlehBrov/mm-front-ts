import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotifyState } from '../../types';

const initialState: NotifyState = {
  isNotifyOpen: false,
  isIdleOpen: false,
  idleOpenChecking: false,
  showNoProdError: false,
};

const notifySlice = createSlice({
  name: 'notify',
  initialState,
  reducers: {
    setIsNotifyOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotifyOpen = action.payload;
    },
    setIsIdleOpen: (state, action: PayloadAction<boolean>) => {
      state.isIdleOpen = action.payload;
    },
    setIdleOpenChecking: (state, action: PayloadAction<boolean>) => {
      state.idleOpenChecking = action.payload;
    },
    setNoProdError: (state, action: PayloadAction<boolean>) => {
      state.showNoProdError = action.payload;
    },
  },
});

export const {
  setIsNotifyOpen,
  setIsIdleOpen,
  setIdleOpenChecking,
  setNoProdError,
} = notifySlice.actions;

export default notifySlice.reducer;
