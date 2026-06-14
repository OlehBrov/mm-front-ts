import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectedQuantityState } from '../../types';

const initialState: SelectedQuantityState = {
  totalSelected: 0,
  totalRemain: 0,
  mainSelected: 0,
  childSelected: 0,
  maxAvailable: 0,
};

const selectedQuantitySlice = createSlice({
  name: 'selectedQuantity',
  initialState,
  reducers: {
    setMaxAvailable: (state, action: PayloadAction<number>) => {
      state.maxAvailable = action.payload;
      state.totalRemain = action.payload - state.totalSelected;
    },
    setTotalSelected: (state, action: PayloadAction<number>) => {
      state.totalSelected = action.payload;
      state.totalRemain = state.totalRemain - action.payload;
    },
    setMainSelected: (state, action: PayloadAction<number>) => {
      state.mainSelected = action.payload;
      state.totalSelected = action.payload;
    },
    incrementMainSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected < state.maxAvailable) {
        state.mainSelected += action.payload;
        state.totalSelected += action.payload;
        state.totalRemain -= action.payload;
      }
    },
    decrementMainSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected > 0) {
        state.mainSelected -= action.payload;
        state.totalSelected -= action.payload;
        state.totalRemain += action.payload;
      }
    },
    incrementChildSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected < state.maxAvailable) {
        state.childSelected += action.payload;
        state.totalSelected += action.payload;
        state.totalRemain -= action.payload;
      }
    },
    decrementChildSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected > 0) {
        state.childSelected -= action.payload;
        state.totalSelected -= action.payload;
        state.totalRemain += action.payload;
      }
    },
    incrementTotalSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected < state.maxAvailable) {
        state.totalSelected += action.payload;
        state.totalRemain -= action.payload;
      }
    },
    decrementTotalSelected: (state, action: PayloadAction<number>) => {
      if (state.totalSelected > 0) {
        state.totalSelected -= action.payload;
        state.totalRemain += action.payload;
      }
    },
    resetTotalSelected: () => initialState,
  },
});

export const {
  setMaxAvailable,
  setTotalSelected,
  incrementTotalSelected,
  decrementTotalSelected,
  resetTotalSelected,
  incrementMainSelected,
  decrementMainSelected,
  incrementChildSelected,
  decrementChildSelected,
  setMainSelected,
} = selectedQuantitySlice.actions;

export default selectedQuantitySlice.reducer;
