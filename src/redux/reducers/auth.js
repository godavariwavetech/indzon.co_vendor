import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../utils/api';
import {endpoints} from '../../config/config';

const initialState = {
  message: null,
  loading: false,
  token: null,
  userRole: 1,
  userId: null,
};

export const vendorLogin = createAsyncThunk(
  'vendorLogin',
  async ({phoneNumber, password}, {rejectWithValue, fulfillWithValue}) => {
    const data = {
      number: phoneNumber,
      password: password,
    };
    const response = await api.post(endpoints.LOGIN, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);

export const verifyNumber = createAsyncThunk(
  'verifyNumber',
  async ({phoneNumber}, {rejectWithValue, fulfillWithValue}) => {
    const data = {
      number: phoneNumber,
    };
    const response = await api.post(endpoints.CHECKTHEMOBILENUMBER, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);

export const changePassword = createAsyncThunk(
  'changePassword',
  async ({phoneNumber, newPassword}, {rejectWithValue, fulfillWithValue}) => {
    const data = {
      number: phoneNumber,
      password: newPassword,
    };
    const response = await api.post(endpoints.UPDATENEWPASSWORD, data);
    if (response) {
      if (response.data) {
        return fulfillWithValue(response.data);
      } else {
        return rejectWithValue('Something went wrong!');
      }
    }
  },
);

export const fetchLocations = createAsyncThunk(
  'fetchLocations',
  async (_, {rejectWithValue, fulfillWithValue}) => {
    try {
      // ✅ Use your API + endpoint constant
      const response = await api.get(endpoints.GETLOCATION);
      const data = response.data; // axios automatically parses JSON
      // console.log('Fetched locations from API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(
          data.data.map(loc => ({
            id: loc.id,
            name: loc.location_name,
            location_latitude: loc.location_latitude, // ✅ include
            location_longitude: loc.location_longitude, // ✅ include
          })),
        );
      } else {
        return rejectWithValue('No locations found or invalid response');
      }
    } catch (error) {
      // console.error('Fetch locations error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch locations',
      );
    }
  },
);

export const fetchCategories = createAsyncThunk(
  'fetchCategories',
  async (_, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.get(endpoints.GETCATEGORIES);
      const data = response.data;
      // console.log('Fetched categories from API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(
          data.data.map(cat => ({
            id: cat.id,
            name: cat.category_name, 
            shop_items_tb_nm: cat.shop_items_tb_nm, // ✅ include table name

          })),
        );
      } else {
        return rejectWithValue('No categories found or invalid response');
      }
    } catch (error) {
      // console.error('Fetch categories error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch categories',
        
      );
    }
  },
);

export const fetchSubCategories = createAsyncThunk(
  'fetchSubCategories',
  async (categoryId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.get(
        `${endpoints.GETSUBCATEGORIES}/${categoryId}`,
      );
      const data = response.data;
      // console.log('Fetched subcategories from API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(
          data.data.map(sub => ({
            id: sub.id,
            name: sub.sub_category_name,
            sub_category_image: sub.sub_category_image, // ✅ include image

          })),
        );
      } else {
        return rejectWithValue('No subcategories found or invalid response');
      }
    } catch (error) {
      // console.error('Fetch subcategories error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch subcategories',
      );
    }
  },
);

export const fetchFilters = createAsyncThunk(
  'fetchFilters',
  async (categoryId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.get(`${endpoints.GETFILTERS}/${categoryId}`);
      const data = response.data;
      // console.log('Fetched filters from API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(
          data.data.map(f => ({
            id: f.id,
            name: f.main_filter_name, // adjust based on your API response
          })),
        );
      } else {
        return rejectWithValue('No filters found or invalid response');
      }
    } catch (error) {
      // console.error('Fetch filters error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch filters',
      );
    }
  },
);

export const registerVendor = createAsyncThunk(
  'registerVendor',
  async (payload, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.REGISTERVENDOR, payload);
      const data = response.data;
      console.log('Register Vendor API response:', data);

      if (data?.status === 200) {
        return fulfillWithValue(data);
      } else {
        return rejectWithValue(data?.msg || 'Vendor registration failed');
      }
    } catch (error) {
      console.error('Register Vendor error:', error);
      return rejectWithValue(
        error.response?.data?.msg ||
          'Something went wrong while registering vendor',
      );
    }
  },
);

export const requestLoginOtp = createAsyncThunk(
  'requestLoginOtp',
  async (mobileNumber, {rejectWithValue, fulfillWithValue}) => {
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
    builder.addCase(requestLoginOtp.pending, state => {
      state.message = null;
    });
    builder.addCase(requestLoginOtp.fulfilled, (state, action) => {
      state.message = null;
    });
    builder.addCase(requestLoginOtp.rejected, state => {
      state.message = 'Please try again!';
    });

    builder.addCase(vendorLogin.pending, state => {
      state.message = null;
    });
    builder.addCase(vendorLogin.fulfilled, (state, action) => {
      state.message = null;
      console.log(action.payload, '>>>>>>>>>>>>>>>>>>>>responseses');
    });
    builder.addCase(vendorLogin.rejected, state => {
      state.message = 'Please try again!';
    });
  },
});

export const {actionLogout, actionLogin} = AuthSlice.actions;

export default AuthSlice.reducer;
