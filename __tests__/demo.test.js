import api from '../src/utils/api';
jest.mock('../src/utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => {
      throw new Error('Unexpected network');
    }),
    post: jest.fn(() => {
      throw new Error('Unexpected network');
    }),
  },
}));
import {configureStore} from '@reduxjs/toolkit';
import reducer, {
  fetchCurrentOrders,
  fetchDashboardOrders,
  fetchProductsList,
  updateOrderStatus,
  updateProduct,
  vendorLogin,
} from '../src/redux/reducers/auth';
import {demoAction, resetDemo, snapshot} from '../src/demo/store';

beforeEach(() => {
  resetDemo();
  jest.clearAllMocks();
});
afterEach(() => {
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
});
test('all existing demo data actions are local and unknown actions fail closed', () => {
  expect(demoAction('vendorLogin', {phoneNumber: '9000000101', password: 'Indzon@123'}).status).toBe(200);
  expect(demoAction('fetchCategories')).toHaveLength(4);
  expect(demoAction('fetchOrderDetails', 1001)).toHaveLength(2);
  expect(() => demoAction('unhandledEndpoint')).toThrow(
    'Unsupported action:',
  );
});
test('order workflow synchronizes inventory, reports, payments and notifications', async () => {
  const store = configureStore({reducer: {Auth: reducer}});
  const before = snapshot();
  const order = before.pendingOrders[0];
  for (const status of [1, 8, 3])
    await store
      .dispatch(
        updateOrderStatus({orderId: order.id, orderStatus: String(status)}),
      )
      .unwrap();
  const after = store.getState().Auth;
  expect(after.pendingOrders).toHaveLength(before.pendingOrders.length - 1);
  expect(after.dashboardOrders.find(o => o.id === order.id).order_status).toBe(
    3,
  );
  expect(after.shopPayments.total_orders).toBe(
    before.shopPayments.total_orders + 1,
  );
  expect(after.paymentHistory).toHaveLength(before.paymentHistory.length + 1);
  expect(
    after.products.find(p => p.id === order.items[0].product_id).stock,
  ).toBe(
    before.products.find(p => p.id === order.items[0].product_id).stock -
      order.items[0].quantity,
  );
  const paidCount = after.paymentHistory.length;
  await store
    .dispatch(updateOrderStatus({orderId: order.id, orderStatus: '3'}))
    .unwrap();
  expect(store.getState().Auth.paymentHistory).toHaveLength(paidCount);
  await store.dispatch(fetchCurrentOrders(101)).unwrap();
  await store.dispatch(fetchProductsList(101)).unwrap();
  expect(store.getState().Auth.pendingOrders).toHaveLength(
    after.pendingOrders.length,
  );
});
test('stock validation is atomic, rejection restores reserved inventory', () => {
  const before = snapshot();
  const order = before.pendingOrders[0];
  const product = before.products.find(p => p.id === order.items[1].product_id);
  demoAction('updateProduct', {...product, stock: 0});
  expect(() =>
    demoAction('updateOrderStatus', {orderId: order.id, orderStatus: 1}),
  ).toThrow('Insufficient');
  expect(snapshot().products[0].stock).toBe(before.products[0].stock);
  demoAction('updateProduct', product);
  demoAction('updateOrderStatus', {orderId: order.id, orderStatus: 1});
  demoAction('updateOrderStatus', {orderId: order.id, orderStatus: 5});
  expect(snapshot().products).toEqual(before.products);
});
test('product changes survive refresh; historical orders retain their original prices', async () => {
  const store = configureStore({reducer: {Auth: reducer}});
  const original = snapshot().dashboardOrders[0].items[0].price;
  const product = snapshot().products[0];
  await store
    .dispatch(
      updateProduct({
        ...product,
        selling_price: 999,
        description: 'Updated',
        stock: 77,
      }),
    )
    .unwrap();
  await store.dispatch(fetchProductsList(101)).unwrap();
  expect(store.getState().Auth.products[0].stock).toBe(77);
  expect(snapshot().dashboardOrders[0].items[0].price).toBe(original);
  demoAction('addDemoProduct', {
    ...product,
    id: undefined,
    item_name: 'New product',
  });
  expect(snapshot().products).toHaveLength(9);
  demoAction('deleteDemoProduct', product.id);
  expect(snapshot().products).toHaveLength(8);
  expect(() => demoAction('updateProduct', {...product, stock: -1})).toThrow();
});
test('login, filtering and reset use only demo records', async () => {
  const store = configureStore({reducer: {Auth: reducer}});
  expect(store.getState().Auth.userId).toBeNull();
  expect(store.getState().Auth.token).toBeNull();
  for (const credentials of [
    {phoneNumber: '', password: ''},
    {phoneNumber: '123', password: 'Indzon@123'},
    {phoneNumber: '9000000101', password: '   '},
  ]) {
    const result = await store.dispatch(vendorLogin(credentials));
    expect(vendorLogin.rejected.match(result)).toBe(true);
    expect(store.getState().Auth.userId).toBeNull();
  }
  await store.dispatch(vendorLogin({phoneNumber: '9000000101', password: 'Indzon@123'})).unwrap();
  expect(store.getState().Auth.userId).toBe(101);
  await store
    .dispatch(
      fetchDashboardOrders({f_date: '2000-01-01', t_date: '2000-01-02'}),
    )
    .unwrap();
  expect(store.getState().Auth.dashboardOrders).toEqual([]);
  demoAction('deleteAccount');
  expect(snapshot().dashboardOrders).toHaveLength(11);
});

test('completed settlements match earnings, historical order totals and details remain consistent', () => {
  const state = snapshot();
  state.dashboardOrders.forEach(o => {
    expect(o.item_count).toBe(
      o.items.reduce((sum, item) => sum + item.quantity, 0),
    );
    expect(o.grand_total).toBeCloseTo(
      o.item_amount +
        o.total_item_gst_amount +
        o.delivery_charges -
        o.coupon_amount,
    );
  });
  const paid = state.paymentHistory.reduce(
    (sum, t) => sum + t.total_payment_amount,
    0,
  );
  expect(paid).toBeCloseTo(
    state.shopPayments.item_amount +
      state.shopPayments.item_amount_gst -
      state.shopPayments.admin_service_fee,
  );
  expect(
    state.paymentHistory.every(
      t => t.shop_phone_number && t.total_orders === 1,
    ),
  ).toBe(true);
});
