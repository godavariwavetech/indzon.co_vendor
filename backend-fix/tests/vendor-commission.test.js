const test = require('node:test');
const assert = require('node:assert/strict');
const {calculateVendorCommission: calculate} = require('../utils/vendor-commission');

test('10 percent commission on 1000 leaves the vendor 900', () => {
    assert.deepEqual(calculate({type: 'percentage', value: '10.00', orderAmount: '1000.00'}),
        {orderAmount: 1000, commissionAmount: 100, vendorAmount: 900});
});
test('fixed rupee commission is independent of order subtotal', () => {
    assert.equal(calculate({type: 'amount', value: 50, orderAmount: 1000}).vendorAmount, 950);
    assert.equal(calculate({type: 'amount', value: 50, orderAmount: 2000}).vendorAmount, 1950);
});
test('handles zero, full percentage and rounding to paise', () => {
    assert.equal(calculate({type: 'percentage', value: 0, orderAmount: 1000}).vendorAmount, 1000);
    assert.equal(calculate({type: 'percentage', value: 100, orderAmount: 1000}).vendorAmount, 0);
    assert.equal(calculate({type: 'percentage', value: '12.50', orderAmount: '99.99'}).vendorAmount, 87.49);
});
test('rejects invalid settings instead of inventing a payout', () => {
    for (const input of [
        {type: 0, value: 10, orderAmount: 1000},
        {type: 'percentage', value: 101, orderAmount: 1000},
        {type: 'percentage', value: -1, orderAmount: 1000},
        {type: 'amount', value: 1001, orderAmount: 1000},
        {type: 'amount', value: '', orderAmount: 1000},
        {type: 'amount', value: 10, orderAmount: 'invalid'},
    ]) assert.throws(() => calculate(input));
});
