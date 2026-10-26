import {getOrderGst} from '../src/utils/orderPayment';

test('uses order GST when an item row contains zero', () => {
  expect(getOrderGst({total_item_gst_amount: '12.50'}, [{total_item_gst_amount: '0.00'}])).toBe(12.5);
});

test('preserves an explicit tax-free order', () => {
  expect(getOrderGst({total_item_gst_amount: '0.00'}, [{total_item_gst_amount: 12.5}])).toBe(0);
});

test('reads detail GST once without summing repeated order totals', () => {
  expect(getOrderGst({}, [{total_item_gst_amount: ''}, {total_item_gst_amount: '12.50'}, {total_item_gst_amount: '12.50'}])).toBe(12.5);
});

test('ignores invalid amounts and handles missing details', () => {
  expect(getOrderGst({total_item_gst_amount: 'invalid'}, [{total_item_gst_amount: '5'}])).toBe(5);
  expect(getOrderGst({})).toBe(0);
});

test('order 000040 includes delivery and platform GST despite zero item GST', () => {
  expect(getOrderGst({
    total_item_gst_amount: '0', delivery_charges_gst: '7.2',
    gstonplatform_fee: '0.9', packing_charges_gst: '0', razorpay_gst: '0',
  })).toBe(8.1);
});

test('includes every GST component once when totals repeat on detail rows', () => {
  const totals = {
    total_item_gst_amount: '10', delivery_charges_gst: '7.2',
    gstonplatform_fee: '0.9', packing_charges_gst: '1.8', razorpay_gst: '0.36',
  };
  expect(getOrderGst({}, [totals, totals])).toBe(20.26);
  expect(getOrderGst(totals, [totals, totals])).toBe(20.26);
});
