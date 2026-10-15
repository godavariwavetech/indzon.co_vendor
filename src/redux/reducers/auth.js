import {createSlice} from '@reduxjs/toolkit';
import {createAsyncThunk, snapshot} from '../../demo/store';
import {DEMO_MODE} from '../../demo/config';
import api from '../../utils/api';
import {endpoints} from '../../config/config';

const initialState = {
  message: null,
  loading: false,
  token: null,
  userRole: 1,
  userId: null,
  pendingOrders: [],
  OrdersInProcess: [],
  shopPayments: null,
  shopDetails: null,
  paymentHistory: [],
  products: [],
  dashboardOrders: [],
  applicationCommon: null,
  ...(DEMO_MODE ? snapshot() : {}),
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
      const response = await api.post(endpoints.GETPROFILEDETAILS, {
        user_id: userId
      });



      const data = response.data;

      console.log(data,">>>>>>>>>>>>>>>>>DATATATATATATATA>>>>>>>>>>>>>>>");

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
          shop_active_status: shop.shop_active_status,
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
export const updateShopStatus = createAsyncThunk(
  'updateShopStatus',
  async (
    {shop_id, shop_active_status},
    {rejectWithValue, fulfillWithValue},
  ) => {
    try {
      const payload = {
        shop_id: Number(shop_id),
        active_status: Number(shop_active_status),
      };

      console.log('📤 Sending shop status update payload:', payload);

      const response = await api.post(endpoints.UPDATESHOPSTATUSS, payload);

      console.log('📥 API Response (updateShopStatus):', response.data);

      const data = response.data;

      if (data?.status === 200) {
        return fulfillWithValue({
          shop_id: Number(shop_id),
          shop_active_status: Number(shop_active_status),
        }); // normalized payload returned
      } else {
        return rejectWithValue(data?.msg || 'Failed to update shop status');
      }
    } catch (error) {
      console.log(
        '❌ API Error (updateShopStatus):',
        error.response?.data || error.message,
      );
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to update shop status',
      );
    }
  },
);

export const updateVendorPassword = createAsyncThunk(
  'updateVendorPassword',
  async ({userId, newPassword}, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.UPDATEVENDORSPASSWORD, {
        user_id: userId,
        newPassword: newPassword,
      });

      const data = response.data;
      console.log('Update Password API response:', data);

      if (data?.status === 200) {
        return fulfillWithValue(data.msg || 'Password updated successfully');
      } else {
        return rejectWithValue(data?.msg || 'Failed to update password');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Error updating password',
      );
    }
  },
);
export const fetchCurrentOrders = createAsyncThunk(
  'fetchCurrentOrders',
  async (userId, {rejectWithValue, fulfillWithValue}) => {
    try {
      console.log(userId,">>>>>>>>>>>>>>>>userId");
      const response = await api.post(endpoints.GETCURRENTORDERS, {
        shop_id: userId,
      });

      const data = response.data;
      console.log(data,">>>>>>>>>>>>>>>DATAATTT");
      //  console.log('GETCURRENTORDERS response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        // Separate orders by status
        const pendingOrders = [];
        const OrdersInProcess = [];

        data.data.forEach(order => {
          const formattedOrder = {
            status: order.order_status === 0 ? 'Pending' : 'Orders In Process',

            // id: order.id, //{order_id},
            //date: order.order_date,
            // time: order.order_time,
            // address: order.delivery_address,
            // total: order.grand_total,
            // paymentMethod: order.payment_type,
            //items: [], // ✅ You can fetch items with another API if available
          };

          if (order.order_status === 0) {
            pendingOrders.push(order);
          } else {
            OrdersInProcess.push(order);
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
export const fetchOrderDetails = createAsyncThunk(
  'fetchOrderDetails',
  async (orderId, {rejectWithValue, fulfillWithValue}) => {
    try {
      //  console.log(orderId, '>>>>>>>>>>>>>>>>orderId');
      const response = await api.post(endpoints.NEWGETORDERDETAILS, {
        orderid: orderId,
      });
      console.log("orderid",orderId)

      const data = response.data;

      console.log(data,">>>>>>>>>>>>>>>>>RESSSSSSSSSSPONSEEE");
      //  console.log('ORDER DETAILS API response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        const items = data.data.map(item => ({
          //id: item.item_id,
          name: item.item_name,
          image: item.item_image,
          price: item.item_price,
          quantity: item.sub_item_count,

          isVeg: item.filter_one?.toLowerCase() === 'veg', // ✅ true if veg
          filter_one: item.filter_one,

          // ✅ Payment Details (from API)
          item_count: item.item_count,
          item_total_amount: item.item_total_amount,
          coupon_amount: item.coupon_amount,
          coupon_type: item.coupon_type,
          total_item_gst_amount: item.total_item_gst_amount,
          grand_total: item.grand_total,
          order_date: item.order_date,
          order_time: item.order_time,
        }));
        return fulfillWithValue(items);
      } else {
        return rejectWithValue('No items found for this order');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch order details',
      );
    }
  },
);
export const updateOrderStatus = createAsyncThunk(
  'updateOrderStatus',
  async ({orderId, orderStatus}, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.UPDATEORDERSTATUS, {
        order_status: orderStatus,
        order_id: orderId,
      });

      const data = response.data;
      console.log('UPDATE ORDER STATUS response:', data);

      if (data?.status === 200) {
        return fulfillWithValue({orderId, orderStatus});
      } else {
        return rejectWithValue(data?.msg || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update order status error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to update order status',
      );
    }
  },
);
export const fetchShopPayments = createAsyncThunk(
  'fetchShopPayments',
  async (userId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.GETSHOPSFORPAYMENTS, {
        user_id: userId,
      });

      console.log({
        user_id: userId,
      },">>>>>>>>>>>>>>>>>>>>PAyload");

      const data = response.data;
      console.log('getshopsforpayments API response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(data.data[0]); // take first shop
      } else {
        return rejectWithValue('No payment data found');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch shop payments',
      );
    }
  },
);
export const fetchPaymentHistory = createAsyncThunk(
  'fetchPaymentHistory',
  async ({f_date, t_date, userId}, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.GETPAYMENTHISTORY, {
        f_date,
        t_date,
        shop_id: userId,
      });

      const data = response.data;
      console.log('Payment History API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(data.data);
      } else {
        return rejectWithValue('No transactions found');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch transactions',
      );
    }
  },
);

export const fetchProductsList = createAsyncThunk(
  'fetchProductsList',
  async (shopId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.GETPRODUCTSLISTDATA, {
        shop_id: shopId,
      });

      const data = response.data;
      console.log('Products API response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(data.data);
      } else {
        return rejectWithValue('No products found');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch products',
      );
    }
  },
);

// src/redux/reducers/auth.js

export const updateProduct = createAsyncThunk(
  'updateProduct',
  async (payload, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.UPDATESHOPPRODUCTS, payload);

      const data = response.data;
      console.log('Update Product API response:', data);

      if (data?.status === 200) {
        return fulfillWithValue(payload); // return updated data
      } else {
        return rejectWithValue(data?.msg || 'Failed to update product');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'API Error');
    }
  },
);

export const updateProductStatus = createAsyncThunk(
  'updateProductStatus',
  async (payload, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.UPDATEPRODUCTACTIVE, payload);

      const data = response.data;
      console.log('Update Product Status API response:', data);

      if (data?.status === 200) {
        return fulfillWithValue(payload);
      } else {
        return rejectWithValue(data?.msg || 'Failed to update product status');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || 'API Error');
    }
  },
);

export const fetchDashboardOrders = createAsyncThunk(
  'fetchDashboardOrders',
  async ({f_date, t_date, userId}, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.GETDASHBOARDORDERS, {
        f_date,
        t_date,
        shop_id: userId,
      });

      console.log(response,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>response", {
        f_date,
        t_date,
        shop_id: userId,
      });

      const data = response.data;
      console.log('Dashboard Orders API:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(data.data);
      } else {
        return rejectWithValue('No orders found');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch orders',
      );
    }
  },
);

export const updateFCMToken = createAsyncThunk(
  'updateFCMToken',
  async ({userId, fcmToken}, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.UPDATE_FCM_TOKEN, {
        user_id: userId,
        player_id: fcmToken,
      });
      const data = response.data;
      console.log('Update FCM Token response:', response);
      console.log('Update FCM Token response.data:', data);
      console.log('Update FCM Token  fcm token:', fcmToken);
      console.log('Update FCM Token  user id:', userId);

      if (data?.status === 200) {
        return fulfillWithValue(data);
      } else {
        return rejectWithValue(data?.msg || 'Failed to update FCM token');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to update FCM token',
      );
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'deleteAccount',
  async (userId, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.post(endpoints.DELETE_ACCOUNT, {
        id: userId,
      });

      const data = response.data;
      console.log('Delete Account API response:', data);

      if (data?.status === 200) {
        return fulfillWithValue(data);
      } else {
        return rejectWithValue(data?.msg || 'Failed to delete account');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to delete account',
      );
    }
  },
);

export const fetchApplicationCommon = createAsyncThunk(
  'fetchApplicationCommon',
  async (_, {rejectWithValue, fulfillWithValue}) => {
    try {
      const response = await api.get(endpoints.APPLICATION_COMMON);
      const data = response.data;
     // console.log('Application Common API response:', data);

      if (data?.status === 200 && Array.isArray(data?.data)) {
        return fulfillWithValue(data.data[0]);
      } else {
        return rejectWithValue('No common data found');
      }
    } catch (error) {
       console.error('Fetch Application Common error:', error);
      return rejectWithValue(
        error.response?.data?.msg || 'Failed to fetch common data',
      );
    }
  },
);

export const AuthSlice = createSlice({
  name: 'authlice',
  initialState,
  reducers: {
    actionLogout: state => {
      state.token = null;
      state.userId = null;

    },
    actionLogin: state => {
      state.token = 'sampletoken';
    },
  },
  extraReducers: builder => {
    builder.addCase(vendorLogin.pending, state => {
      state.message = null;
    });
    builder.addCase(vendorLogin.fulfilled, (state, action) => {
      state.message = null;
      console.log(action.payload, '>>>>>>>responseses',action.payload?.data[0]?.id);
      // FIX: use "id" instead of "user_id"
      state.userId = action.payload?.data[0]?.id || null;
      //  state.token = action.payload?.token || null;
    });
    builder.addCase(vendorLogin.rejected, state => {
      state.message = 'Please try again!';
    });

    builder.addCase(registerVendor.fulfilled, (state, action) => {
      console.log('Vendor Registered:', action.payload);
      // state.userId = action.payload?.data?.id || null;
      // state.token = action.payload?.token || null;
    });
    builder.addCase(fetchCurrentOrders.pending, state => {
      state.loading = true;
    });

    builder.addCase(fetchCurrentOrders.fulfilled, (state, action) => {
      state.loading = false;
      // console.log(action.payload, '>>>>>>>responseses');
      state.pendingOrders = action.payload.pendingOrders;
      state.OrdersInProcess = action.payload.OrdersInProcess;
      // state.user_Id = action.payload?.data?.id || null;
      //console.log(action.payload, '>>>>>>>responseses');
    });

    builder.addCase(fetchCurrentOrders.rejected, (state, action) => {
      state.loading = false;
      state.pendingOrders = [];
      state.OrdersInProcess = [];
      state.message = action.payload || 'Failed to load current orders';
    });

    builder.addCase(fetchShopPayments.pending, state => {
      state.loading = true;
    });
    builder.addCase(fetchShopPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.shopPayments = action.payload;
    });
    builder.addCase(fetchShopPayments.rejected, (state, action) => {
      state.loading = false;
      state.shopPayments = null;
      state.message = action.payload || 'Failed to load shop payments';
    });

    builder.addCase(fetchShopDetails.fulfilled, (state, action) => {
      state.shopDetails = action.payload;
    });

    builder.addCase(fetchPaymentHistory.pending, state => {
      state.loading = true;
    });
    builder.addCase(fetchPaymentHistory.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentHistory = action.payload;
    });
    builder.addCase(fetchPaymentHistory.rejected, (state, action) => {
      state.loading = false;
      state.paymentHistory = [];
      state.message = action.payload || 'Failed to load payment history';
    });

    builder.addCase(fetchProductsList.pending, state => {
      state.loading = true;
    });
    builder.addCase(fetchProductsList.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload; // ✅ keep full list in redux
    });
    builder.addCase(fetchProductsList.rejected, (state, action) => {
      state.loading = false;
      state.products = [];
      state.message = action.payload || 'Failed to load products';
    });

    builder.addCase(updateProduct.fulfilled, (state, action) => {
      const updated = action.payload;
      state.products = state.products.map(p =>
        p.id === updated.id ? {...p, ...updated} : p,
      );
    });

    builder.addCase(updateProductStatus.fulfilled, (state, action) => {
      const updated = action.payload;
      state.products = state.products.map(p =>
        p.id === updated.id ? {...p, active_status: updated.active_status} : p,
      );
    });

    builder.addCase(updateShopStatus.fulfilled, (state, action) => {
      if (
        state.shopDetails &&
        state.shopDetails.id === action.payload.shop_id
      ) {
        state.shopDetails.shop_active_status =
          action.payload.shop_active_status;
      }
    });

    builder.addCase(fetchDashboardOrders.pending, state => {
      state.loading = true;
    });
    builder.addCase(fetchDashboardOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardOrders = action.payload;
    });
    builder.addCase(fetchDashboardOrders.rejected, (state, action) => {
      state.loading = false;
      state.dashboardOrders = [];
      state.message = action.payload || 'Failed to load orders';
    });

    builder.addCase(fetchApplicationCommon.pending, state => {
      // state.loading = true; // Optional: separate loading state if needed
    });
    builder.addCase(fetchApplicationCommon.fulfilled, (state, action) => {
      // state.loading = false;
      state.applicationCommon = action.payload;
    });
    builder.addCase(fetchApplicationCommon.rejected, (state, action) => {
      // state.loading = false;
      state.message = action.payload || 'Failed to load common data';
    });
  },
});

export const {actionLogout, actionLogin} = AuthSlice.actions;

export default function authReducer(state, action) {
  if (DEMO_MODE && action.type === 'demo/sync') return {...state, ...action.payload, loading: false};
  return AuthSlice.reducer(state, action);
}
