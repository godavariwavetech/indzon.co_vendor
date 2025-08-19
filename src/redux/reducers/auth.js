import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../utils/api';
import {endpoints} from '../../config/config';

const initialState = {
  message: null,
  loading: false,
  token: null,
  userRole: 1,
  userId:null,
};



export const requestLoginOtp = createAsyncThunk(
  'requestLoginOtp',
  async (
    mobileNumber,
    { rejectWithValue, fulfillWithValue},
  ) => {
    const data = {
      number: mobileNumber,
    };
    const response = await api.post(endpoints.REQUEST_LOGIN_OPT, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);

export const AuthSlice = createSlice({
  name: 'authlice',
  initialState,
  reducers: {
    actionLogout: state => {
      state.token = null;
    },
    actionLogin: state => {
      state.token = 'sampletoken';
    },
  },
  extraReducers: builder => {
    builder.addCase(requestLoginOtp.pending, (state) => {
      state.message = null;
    });
    builder.addCase(requestLoginOtp.fulfilled, (state, action) => {
      state.message = null;
    });
    builder.addCase(requestLoginOtp.rejected, (state) => {
      state.message = 'Please try again!';
    });
  },
});

export const {
  actionLogout,
  actionLogin
} = AuthSlice.actions;

export default AuthSlice.reducer;
