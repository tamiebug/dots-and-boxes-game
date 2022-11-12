import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import locationGridReducer from '../features/locationGrid/locationGridSlice';

export const setUpStore = () => configureStore({
  reducer: {
    locationGrid: locationGridReducer,
  },
});

export const store = setUpStore();

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
