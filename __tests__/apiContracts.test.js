import {configureStore} from '@reduxjs/toolkit';
import api from '../src/utils/api';
import reducer, * as actions from '../src/redux/reducers/auth';
import {endpoints} from '../src/config/config';

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
test.each([{status: 400, msg: 'Invalid credentials'}, {status: 200}, {}])('invalid login response never authenticates: %j', async data => {
  const store = makeStore();
  api.post.mockResolvedValue({data});
  await store.dispatch(actions.vendorLogin({phoneNumber: '9876543210', password: 'bad'}));
  expect(store.getState().Auth.userId).toBeNull();
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
