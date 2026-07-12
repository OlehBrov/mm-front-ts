import { createSlice } from '@reduxjs/toolkit';

interface SetupAuthState {
  unlocked: boolean;
}

const initialState: SetupAuthState = { unlocked: false };

const setupAuthSlice = createSlice({
  name: 'setupAuth',
  initialState,
  reducers: {
    unlockSetup: (state) => {
      state.unlocked = true;
    },
    lockSetup: (state) => {
      state.unlocked = false;
    },
  },
});

export const { unlockSetup, lockSetup } = setupAuthSlice.actions;
export default setupAuthSlice.reducer;
