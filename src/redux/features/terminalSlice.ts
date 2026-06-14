import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TerminalState {
  status: string;
}

const terminalSlice = createSlice({
  name: 'terminalState',
  initialState: { status: 'unknown' } as TerminalState,
  reducers: {
    setTerminalState: (state, action: PayloadAction<string>) => {
      state.status = action.payload;
    },
  },
});

export const { setTerminalState } = terminalSlice.actions;
export default terminalSlice.reducer;
