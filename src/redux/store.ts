import {configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
} from 'redux-persist';

import AsyncStorage from '@react-native-async-storage/async-storage';
import  AuthSlice from './reducers/auth';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};
const persistedAuth = persistReducer(persistConfig, AuthSlice);


export const store = configureStore({
  reducer: {
    Auth: persistedAuth,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // serializableCheck: {
      //   ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      // },
    }),
});

export const persistorStore = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
