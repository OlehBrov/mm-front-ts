import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../types';

const initialState: AuthState = {
  store_id: 0,
  isLoggedIn: false,
  auth_id: '',
  token: '',
  refreshToken: '',
  role: '',
};

const authorizationSlice = createSlice({
  name: 'authLocal',
  initialState,
  reducers: {
    logInStore: (state, { payload }: PayloadAction<AuthState & { single_merchant?: boolean; use_VAT_by_default?: boolean }>) => {
      state.store_id = payload.store_id;
      state.isLoggedIn = true;
      state.auth_id = payload.auth_id;
      state.token = payload.token;
      state.refreshToken = payload.refreshToken;
      state.role = payload.role;
    },
    logOutStore: (state) => {
      state.isLoggedIn = false;
      state.auth_id = '';
      state.token = '';
      state.role = '';
      state.store_id = 0;
    },
    refreshAccessToken: (state, { payload }: PayloadAction<{ token: string }>) => {
      if (payload && payload.token) {
        state.token = payload.token;
      }
    },
  },
});

export const { logInStore, logOutStore, refreshAccessToken } = authorizationSlice.actions;
export default authorizationSlice.reducer;
