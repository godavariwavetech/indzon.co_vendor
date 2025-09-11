import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import api from '../../utils/api';
import {endpoints} from '../../config/config';

const initialState = {
  message: null,
  loading: false,
  token: null,
  userRole: 1,
  userId: null,
    pendingOrders: [],   // ✅ NEW
  OrdersInProcess: [],   // ✅ NEW
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
      const response = await api.get(endpoints.GETLOCATION);
      const data = response.data;
      // console.log('Fetched locations from API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(
          data.data.map(loc => ({
            id: loc.id,
            name: loc.location_name,
            location_latitude: loc.location_latitude,
            location_longitude: loc.location_longitude,
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
            shop_items_tb_nm: cat.shop_items_tb_nm,
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
      // console.error('Register Vendor error:', error);
      return rejectWithValue(
        error.response?.data?.msg ||
          'Something went wrong while registering vendor',
      );
    }
  },
);
export const fetchShopDetails = createAsyncThunk(
  'fetchShopDetails',
  async (userId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(
        endpoints.GETPROFILEDETAILS,
        {user_id: userId},
      );

      const data = response.data;

      if (data?.status === 200 && Array.isArray(data?.data)) {
        const shop = data.data[0]; // Take first shop from array

        return fulfillWithValue({
          id: shop.id,
          name: shop.shop_name,
          address: shop.shop_address,
          timing: `${shop.shop_open_time} - ${shop.shop_close_time}`,
          mobile: shop.shop_phone_number,
          email: shop.shop_email,
          image: shop.shop_image,
        });
      } else {
        return rejectWithValue('No shop found or invalid response');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch shop details',
      );
    }
  },
);

export const fetchCurrentOrders = createAsyncThunk(
  'fetchCurrentOrders',
  async (userId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.GETCURRENTORDERS, {
        user_id: userId,
      });

      const data = response.data;
      console.log('GETCURRENTORDERS response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        // Separate orders by status
        const pendingOrders = [];
        const OrdersInProcess = [];

        data.data.forEach(order => {
          const formattedOrder = {
            id: order.order_id,
            status: order.order_status === 0 ? 'Pending' : 'Orders In Process',
            date: order.order_date,
            time: order.order_time,
            address: order.delivery_address,
            total: order.grand_total,
            paymentMethod: order.payment_type,
            cookingRequest: order.order_instructions,
            customerOtp: order.customer_otp,
            shopName: order.shop_name,
            shopPhone: order.shop_phone_number,
            shopAddress: order.shop_address,
            shopImage: order.shop_image,
            items: [], // ✅ You can fetch items with another API if available
          };

          if (order.order_status === 0) {
            pendingOrders.push(formattedOrder);
          } else {
            OrdersInProcess.push(formattedOrder);
          }
        });

        return fulfillWithValue({pendingOrders, OrdersInProcess});
      } else {
        return rejectWithValue('No current orders found');
      }
    } catch (error) {
      console.error('Fetch Current Orders error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch current orders',
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
  console.log(action.payload, '>>>>>>>responseses');

  // FIX: use "id" instead of "user_id"
  state.userId = action.payload?.data?.id || null;
  state.token = action.payload?.token || null;
});

builder.addCase(registerVendor.fulfilled, (state, action) => {
  console.log('Vendor Registered:', action.payload);
  state.userId = action.payload?.data?.id || null;
  state.token = action.payload?.token || null;
});
builder.addCase(fetchCurrentOrders.pending, state => {
  state.loading = true;
});

builder.addCase(fetchCurrentOrders.fulfilled, (state, action) => {
  state.loading = false;
  state.pendingOrders = action.payload.pendingOrders;
  state.OrdersInProcess = action.payload.OrdersInProcess;
});

builder.addCase(fetchCurrentOrders.rejected, (state, action) => {
  state.loading = false;
  state.pendingOrders = [];
  state.OrdersInProcess = [];
  state.message = action.payload || 'Failed to load current orders';
});



    builder.addCase(vendorLogin.rejected, state => {
      state.message = 'Please try again!';
    });
  },
});

export const {actionLogout, actionLogin} = AuthSlice.actions;

export default AuthSlice.reducer;
