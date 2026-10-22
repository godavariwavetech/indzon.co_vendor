import {configureStore} from '@reduxjs/toolkit';
import api from '../src/utils/api';
import reducer, * as actions from '../src/redux/reducers/auth';
import {endpoints} from '../src/config/config';
import {uniqueHistoryOrders} from '../src/utils/orderHistory';

jest.mock('../src/utils/api', () => ({__esModule: true, default: {get: jest.fn(), post: jest.fn()}}));
const makeStore = () => configureStore({reducer: {Auth: reducer}});
beforeEach(() => { jest.clearAllMocks(); jest.spyOn(console, 'log').mockImplementation(() => {}); });
afterEach(() => jest.restoreAllMocks());

const cases = [
  ['vendorLogin', {phoneNumber: '9876543210', password: 'secret'}, 'post', endpoints.LOGIN, {number: '9876543210', password: 'secret'}, {status: 200, data: [{id: 7}]}],
  ['verifyNumber', {phoneNumber: '9876543210'}, 'post', endpoints.CHECKTHEMOBILENUMBER, {number: '9876543210'}],
  ['changePassword', {phoneNumber: '9876543210', newPassword: 'new'}, 'post', endpoints.UPDATENEWPASSWORD, {number: '9876543210', password: 'new'}],
  ['fetchLocations', undefined, 'get', endpoints.GETLOCATION],
  ['fetchCategories', undefined, 'get', endpoints.GETCATEGORIES],
  ['fetchSubCategories', 2, 'get', `${endpoints.GETSUBCATEGORIES}/2`],
  ['fetchFilters', 2, 'get', `${endpoints.GETFILTERS}/2`],
  ['registerVendor', {name: 'Shop'}, 'post', endpoints.REGISTERVENDOR, {name: 'Shop'}],
  ['fetchShopDetails', 7, 'post', endpoints.GETPROFILEDETAILS, {user_id: 7}, {status: 200, data: [{id: 7}]}],
  ['updateShopStatus', {shop_id: 7, shop_active_status: 0}, 'post', endpoints.UPDATESHOPSTATUSS, {shop_id: 7, active_status: 0}],
  ['updateVendorPassword', {userId: 7, newPassword: 'new'}, 'post', endpoints.UPDATEVENDORSPASSWORD, {user_id: 7, newPassword: 'new'}],
  ['fetchCurrentOrders', 7, 'post', endpoints.GETCURRENTORDERS, {shop_id: 7}],
  ['fetchOrderDetails', 42, 'post', endpoints.NEWGETORDERDETAILS, {orderid: 42}],
  ['updateOrderStatus', {orderId: 42, orderStatus: '1'}, 'post', endpoints.UPDATEORDERSTATUS, {order_id: 42, order_status: '1'}],
  ['fetchShopPayments', 7, 'post', endpoints.GETSHOPSFORPAYMENTS, {user_id: 7}],
  ['fetchPaymentHistory', {userId: 7, f_date: '2026-10-01', t_date: '2026-10-17'}, 'post', endpoints.GETPAYMENTHISTORY, {shop_id: 7, f_date: '2026-10-01', t_date: '2026-10-17'}],
  ['fetchProductsList', 7, 'post', endpoints.GETPRODUCTSLISTDATA, {shop_id: 7}],
  ['updateProduct', {id: 2, shop_id: 7, selling_price: '100'}, 'post', endpoints.UPDATESHOPPRODUCTS, {id: 2, shop_id: 7, selling_price: '100'}],
  ['updateProductStatus', {id: 2, shop_id: 7, active_status: '1'}, 'post', endpoints.UPDATEPRODUCTACTIVE, {id: 2, shop_id: 7, active_status: '1'}],
  ['fetchDashboardOrders', {userId: 7, f_date: '2026-10-01', t_date: '2026-10-17'}, 'post', endpoints.GETDASHBOARDORDERS, {shop_id: 7, f_date: '2026-10-01', t_date: '2026-10-17'}],
  ['updateFCMToken', {userId: 7, fcmToken: 'device'}, 'post', endpoints.UPDATE_FCM_TOKEN, {user_id: 7, player_id: 'device'}],
  ['deleteAccount', 7, 'post', endpoints.DELETE_ACCOUNT, {id: 7}],
  ['fetchApplicationCommon', undefined, 'get', endpoints.APPLICATION_COMMON],
];
test.each(cases)('%s uses the original API contract', async (...row) => {
  const [name, arg, method, url, payload, body] = row;
  api[method].mockResolvedValue({data: body || {status: 200, data: []}});
  await makeStore().dispatch(actions[name](arg));
  if (method === 'get') expect(api.get).toHaveBeenCalledWith(url);
  else expect(api.post).toHaveBeenCalledWith(url, payload);
});
test('login accepts the real vendor id and logout clears vendor data', async () => {
  const store = makeStore();
  api.post.mockResolvedValue({data: {status: 200, data: [{id: 7}], token: 'real-token'}});
  await store.dispatch(actions.vendorLogin({phoneNumber: '9876543210', password: 'secret'}));
  expect(store.getState().Auth).toMatchObject({userId: 7, token: 'real-token'});
  store.dispatch(actions.fetchProductsList.fulfilled([{id: 2}], '', 7));
  store.dispatch(actions.actionLogout());
  expect(store.getState().Auth).toMatchObject({userId: null, token: null, products: [], shopDetails: null});
});
test('login trims mobile whitespace accepted by the input validator', async () => {
  api.post.mockResolvedValue({data: {status: 200, data: [{id: 7}]}});
  await makeStore().dispatch(actions.vendorLogin({phoneNumber: ' 9876543210 ', password: 'secret'}));
  expect(api.post).toHaveBeenCalledWith(endpoints.LOGIN, {number: '9876543210', password: 'secret'});
});
test.each([
  [{code: 'ECONNABORTED'}, 'The server took too long to respond. Please try again.'],
  [new Error('Network Error'), 'Unable to reach the server. Please check your internet connection.'],
])('login reports transport failures without authenticating', async (error, message) => {
  api.post.mockRejectedValue(error);
  const store = makeStore();
  await expect(store.dispatch(actions.vendorLogin({phoneNumber: '9876543210', password: 'secret'})).unwrap()).rejects.toBe(message);
  expect(store.getState().Auth.userId).toBeNull();
});
test.each([{status: 400, msg: 'Invalid credentials'}, {status: 200}, {}])('invalid login response never authenticates: %j', async data => {
  const store = makeStore();
  api.post.mockResolvedValue({data});
  await store.dispatch(actions.vendorLogin({phoneNumber: '9876543210', password: 'bad'}));
  expect(store.getState().Auth.userId).toBeNull();
});
test.each([
  [{status: 200, data: []}, 'Mobile number or password is incorrect.'],
  ['<html>Proxy error</html>', 'The server returned an unexpected sign-in response. Please try again.'],
])('login distinguishes rejected credentials from unexpected responses', async (data, message) => {
  api.post.mockResolvedValue({data});
  await expect(makeStore().dispatch(actions.vendorLogin({phoneNumber: '9876543210', password: 'secret'})).unwrap()).rejects.toBe(message);
});
test('failed product mutation does not change local product data', async () => {
  const store = makeStore();
  store.dispatch(actions.fetchProductsList.fulfilled([{id: 2, selling_price: '100'}], '', 7));
  api.post.mockResolvedValue({data: {status: 400, msg: 'Rejected'}});
  await expect(store.dispatch(actions.updateProduct({id: 2, selling_price: '1'})).unwrap()).rejects.toBe('Rejected');
  expect(store.getState().Auth.products[0].selling_price).toBe('100');
});
test('transport failures reject without demo fallback', async () => {
  api.post.mockRejectedValue(new Error('Offline'));
  const store = makeStore();
  await expect(store.dispatch(actions.fetchProductsList(7)).unwrap()).rejects.toBe('Failed to fetch products');
  expect(store.getState().Auth.products).toEqual([]);
});

test.each([
  ['fetchProductsList', 7, 'products'],
  ['fetchDashboardOrders', {userId: 7, f_date: '2026-01-01', t_date: '2026-10-21'}, 'dashboardOrders'],
  ['fetchPaymentHistory', {userId: 7, f_date: '2026-01-01', t_date: '2026-10-21'}, 'paymentHistory'],
])('%s displays returned records and accepts genuinely empty lists', async (name, arg, key) => {
  const store = makeStore();
  const records = [{id: 42, item_name: 'API product', total_amount: '125'}];
  api.post.mockResolvedValueOnce({data: {status: 200, data: records}});
  await store.dispatch(actions[name](arg)).unwrap();
  expect(store.getState().Auth[key]).toEqual(records);
  api.post.mockResolvedValueOnce({data: {status: 200, data: []}});
  await store.dispatch(actions[name](arg)).unwrap();
  expect(store.getState().Auth[key]).toEqual([]);
  expect(store.getState().Auth.errors[name]).toBeUndefined();
});

test('menu database errors are reported as failures rather than an empty menu', async () => {
  api.post.mockResolvedValue({data: {status: 500, msg: true}});
  const store = makeStore();
  await expect(store.dispatch(actions.fetchProductsList(7)).unwrap()).rejects.toBe('Unable to load menu items from the server. Please try again.');
  expect(store.getState().Auth.errors.fetchProductsList).toBe('Unable to load menu items from the server. Please try again.');
});

test('order history removes identical cards even with different or missing internal ids', async () => {
  const first = {id: 20, order_id: '000020', total_amount: '125'};
  const distinct = {id: 21, order_id: '000020', total_amount: '250'};
  const unidentified = {order_id: '000022'};
  api.post.mockResolvedValue({data: {status: 200, data: [
    first, {...first, id: '20'}, {...first, id: 200},
    {...first, id: undefined, total_amount: 125},
    distinct, unidentified, {...unidentified},
  ]}});
  const store = makeStore();
  const arg = {userId: 7, f_date: '2026-10-01', t_date: '2026-10-22'};
  await store.dispatch(actions.fetchDashboardOrders(arg)).unwrap();
  expect(store.getState().Auth.dashboardOrders).toEqual([first, distinct, unidentified]);
  await store.dispatch(actions.fetchDashboardOrders(arg)).unwrap();
  expect(store.getState().Auth.dashboardOrders).toEqual([first, distinct, unidentified]);
});

test.each([
  ['order_id', '000021'],
  ['order_date_time', '2026-10-23'],
  ['order_time', '13:00'],
  ['order_status', 5],
  ['delivery_address', 'Another address'],
  ['total_amount', '250'],
])('order history preserves cards with different %s', (field, value) => {
  const first = {
    id: 20, order_id: '000020', order_date_time: '2026-10-22',
    order_time: '12:00', order_status: 3, delivery_address: 'Test address',
    total_amount: '125',
  };
  const second = {...first, id: 21, [field]: value};
  expect(uniqueHistoryOrders([first, second])).toEqual([first, second]);
});

test('order history does not merge unidentified records', () => {
  const orders = [{total_amount: 125}, {total_amount: 125}];
  expect(uniqueHistoryOrders(orders)).toEqual(orders);
});

test('current orders handles both numeric and text pending statuses', async () => {
  const orders = [{id: 1, order_status: 0}, {id: 2, order_status: '0'}, {id: 3, order_status: '1'}];
  api.post.mockResolvedValue({data: {status: 200, data: orders}});
  const store = makeStore();
  await store.dispatch(actions.fetchCurrentOrders(7)).unwrap();
  expect(store.getState().Auth.pendingOrders).toEqual(orders.slice(0, 2));
  expect(store.getState().Auth.OrdersInProcess).toEqual(orders.slice(2));
});

test.each(['fetchShopDetails', 'fetchShopPayments'])('%s handles absent records without inventing data', async name => {
  api.post.mockResolvedValue({data: {status: 200, data: []}});
  await expect(makeStore().dispatch(actions[name](7)).unwrap()).resolves.toBeNull();
});
