import {calculateEarnings} from '../src/utils/vendorEarnings';

const payments = {id: 4, item_amount: 84000, total_orders: 1, admin_percentage: 10, admin_service_fee: 0};
test('deducts the configured 10% even when the API fee is incorrectly zero', () => {
  expect(calculateEarnings(payments, {id: 4, commissionType: 0})).toEqual({commission: 8400, earnings: 75600});
});
test('deducts a fixed commission per completed order', () => {
  expect(calculateEarnings({...payments, total_orders: 3, commission_type: 1}, null)).toEqual({commission: 30, earnings: 83970});
});
test('normalizes string amounts and retains existing GST and coupon adjustments', () => {
  expect(calculateEarnings({...payments, item_amount: '1000', commission_type: '0', item_amount_gst: '50', admin_coupon_amount: '20', vendor_coupon_amount: '10'}, null)).toEqual({commission: 100, earnings: 960});
});
test('does not guess a type or use another vendor profile', () => {
  expect(calculateEarnings(payments, {id: 7, commissionType: 0})).toBeNull();
  expect(calculateEarnings({...payments, commission_type: 9}, null)).toBeNull();
  expect(calculateEarnings({...payments, commission_type: 0, admin_percentage: 101}, null)).toBeNull();
});
