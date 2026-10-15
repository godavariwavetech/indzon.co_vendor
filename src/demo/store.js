import {createAsyncThunk as productionThunk} from '@reduxjs/toolkit';
import {DEMO_MODE} from './config';
import * as seed from './data';
import validateLogin from '../utils/validateLogin';

const copy = value => JSON.parse(JSON.stringify(value));
let db;
let nextProductId;
let reportRange;
let paymentRange;
const inRange = (day, range) =>
  !range ||
  ((!range.f_date || day >= range.f_date) &&
    (!range.t_date || day <= range.t_date));
export function resetDemo() {
  db = copy({
    products: seed.products,
    orders: seed.orders,
    vendor: seed.vendor,
    transactions: seed.transactions,
    notifications: seed.notifications,
  });
  nextProductId = Math.max(...db.products.map(p => p.id)) + 1;
  reportRange = paymentRange = undefined;
}
resetDemo();
export function snapshot() {
  const completed = db.orders.filter(o => o.order_status === 3);
  const amount = completed.reduce((sum, o) => sum + o.item_amount, 0);
  return copy({
    products: db.products,
    pendingOrders: db.orders.filter(o => o.order_status === 0),
    OrdersInProcess: db.orders.filter(o => [1, 8].includes(o.order_status)),
    dashboardOrders: db.orders.filter(o => inRange(o.order_date, reportRange)),
    shopDetails: db.vendor,
    paymentHistory: db.transactions
      .filter(t => inRange(t.payment_dates, paymentRange))
      .map(t => {
        const o = db.orders.find(order => order.id === t.order_id);
        return {
          ...t,
          shop_phone_number: db.vendor.mobile,
          total_orders: 1,
          item_amount: o.item_amount,
          item_amount_gst: o.total_item_gst_amount,
          admin_service_fee: Number((o.item_amount * 0.05).toFixed(2)),
        };
      }),
    shopPayments: {
      total_orders: completed.length,
      vendor_payment_otp: '123456',
      item_amount: amount,
      item_amount_gst: completed.reduce(
        (sum, o) => sum + o.total_item_gst_amount,
        0,
      ),
      admin_service_fee: amount * 0.05,
      admin_coupon_amount: 0,
      vendor_coupon_amount: 0,
    },
    applicationCommon: seed.common,
    notifications: db.notifications,
  });
}
export function demoAction(name, arg) {
  const ok = {
    status: 200,
    msg: 'Action completed successfully',
    data: [{id: seed.vendor.id}],
  };
  switch (name) {
    case 'vendorLogin': {
      const validationError = validateLogin(arg?.phoneNumber, arg?.password);
      if (validationError) throw new Error(validationError.message);
      return ok;
    }
    case 'verifyNumber':
    case 'changePassword':
    case 'registerVendor':
    case 'updateFCMToken':
      return ok;
    case 'deleteAccount':
      resetDemo();
      return {...ok, msg: 'Account information has been reset.'};
    case 'updateVendorPassword':
      return 'Password updated successfully';
    case 'fetchLocations':
      return [
        {
          id: 1,
          name: 'Indiranagar',
          location_latitude: 12.97,
          location_longitude: 77.64,
        },
        {
          id: 2,
          name: 'Koramangala',
          location_latitude: 12.93,
          location_longitude: 77.62,
        },
      ];
    case 'fetchCategories':
      return copy(seed.categories);
    case 'fetchSubCategories':
      return copy(
        seed.categories.map(c => ({
          ...c,
          sub_category_image: seed.products[0].item_image,
        })),
      );
    case 'fetchFilters':
      return [
        {id: 1, name: 'Veg'},
        {id: 2, name: 'Non Veg'},
      ];
    case 'fetchShopDetails':
      return copy(db.vendor);
    case 'updateShopStatus':
      db.vendor.shop_active_status = Number(arg.shop_active_status);
      return arg;
    case 'fetchCurrentOrders':
      return snapshot();
    case 'fetchOrderDetails':
      return copy(db.orders.find(o => o.id === Number(arg))?.items || []);
    case 'updateOrderStatus': {
      const order = db.orders.find(o => o.id === Number(arg.orderId));
      const next = Number(arg.orderStatus);
      if (!order) throw new Error('Order not found');
      if (order.order_status === next) return arg;
      const allowed = {0: [1, 5], 1: [8, 5], 8: [3]};
      if (!allowed[order.order_status]?.includes(next))
        throw new Error('This order cannot change to that status');
      if (next === 1) {
        order.items.forEach(item => {
          const product = db.products.find(p => p.id === item.product_id);
          if (
            !product ||
            product.stock < item.quantity ||
            product.active_status !== '0'
          )
            throw new Error(`Insufficient available stock for ${item.name}`);
        });
        order.items.forEach(item => {
          db.products.find(p => p.id === item.product_id).stock -=
            item.quantity;
        });
      }
      if (next === 5 && order.order_status === 1)
        order.items.forEach(item => {
          const p = db.products.find(v => v.id === item.product_id);
          if (p) p.stock += item.quantity;
        });
      order.order_status = next;
      if (next === 3) {
        order.payment_status = 'Paid';
        db.transactions.push({
          id: order.id,
          order_id: order.id,
          total_payment_amount: Number(
            (
              order.item_amount +
              order.total_item_gst_amount -
              order.item_amount * 0.05
            ).toFixed(2),
          ),
          payment_method: 'Bank Transfer',
          payment_dates: seed.today,
          payment_transaction_id: `IZ-TXN-${order.id}`,
          status: 'Completed',
          settlement_date_time: `${seed.today} 12:30 PM`,
        });
      }
      db.notifications.unshift({
        id: Date.now(),
        title: `Order ${order.order_id}`,
        body: `Order ${
          next === 1
            ? 'accepted'
            : next === 8
            ? 'in preparation'
            : next === 3
            ? 'completed'
            : 'rejected'
        }.`,
        read: false,
      });
      return arg;
    }
    case 'fetchShopPayments':
      return snapshot().shopPayments;
    case 'fetchPaymentHistory':
      paymentRange = arg;
      return snapshot().paymentHistory;
    case 'fetchDashboardOrders':
      reportRange = arg;
      return snapshot().dashboardOrders;
    case 'fetchProductsList':
      return copy(db.products);
    case 'updateProduct':
    case 'addDemoProduct': {
      if (
        !arg.item_name?.trim() ||
        !Number.isFinite(Number(arg.selling_price)) ||
        Number(arg.selling_price) <= 0 ||
        !Number.isInteger(Number(arg.stock ?? 0)) ||
        Number(arg.stock ?? 0) < 0
      )
        throw new Error(
          'Enter a name, a positive price and a whole stock quantity',
        );
      const existing = db.products.find(p => p.id === arg.id);
      if (existing) Object.assign(existing, arg);
      else
        db.products.push({
          ...copy(seed.products[0]),
          ...arg,
          id: nextProductId++,
        });
      return arg;
    }
    case 'deleteDemoProduct':
      db.products = db.products.filter(p => p.id !== arg);
      return arg;
    case 'updateProductStatus':
      Object.assign(
        db.products.find(p => p.id === arg.id),
        arg,
      );
      return arg;
    case 'markDemoNotification':
      db.notifications.forEach(n => {
        n.read = true;
      });
      return true;
    case 'fetchApplicationCommon':
      return seed.common;
    default:
      throw new Error(`Unsupported action: ${name}`);
  }
}
// Unknown actions fail locally: there is deliberately no production fallback.
export const createAsyncThunk = (name, production, options) =>
  productionThunk(
    name,
    async (arg, api) => {
      if (!DEMO_MODE) return production(arg, api);
      try {
        const result = demoAction(name, arg);
        api.dispatch({type: 'demo/sync', payload: snapshot()});
        return copy(result);
      } catch (error) {
        return api.rejectWithValue(error.message);
      }
    },
    options,
  );
export const addDemoProduct = createAsyncThunk('addDemoProduct');
export const deleteDemoProduct = createAsyncThunk('deleteDemoProduct');
export const markDemoNotification = createAsyncThunk('markDemoNotification');
