import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MaintenanceState {
  active: boolean;
}

const initialState: MaintenanceState = { active: false };

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setMaintenanceMode: (state, action: PayloadAction<boolean>) => {
      state.active = action.payload;
    },
  },
});

export const { setMaintenanceMode } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
