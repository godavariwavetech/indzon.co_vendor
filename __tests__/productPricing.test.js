import {buildPriceUpdate} from '../src/utils/productPricing';

test('price edits exclude unrelated catalogue fields and round discounts', () => {
  const item = {id: 2, quantity_type: 'kg', item_gst: '5%', item_description: 'Keep this'};
  expect(buildPriceUpdate(item, 7, '120', '99.99')).toEqual({
    id: 2, shop_id: 7, actual_price: '120.00', selling_price: '99.99',
    discount_amount: '20.01', discount_percentage: '16.68',
  });
});

test.each(['', ' ', '-1', 'NaN', 'Infinity', '12abc', '1.234'])('rejects invalid price %j', value => {
  expect(() => buildPriceUpdate({id: 2}, 7, value, '0')).toThrow();
  expect(() => buildPriceUpdate({id: 2}, 7, '100', value)).toThrow();
});

test('rejects selling prices above actual price', () => {
  expect(() => buildPriceUpdate({id: 2}, 7, '100', '101')).toThrow('Selling price cannot exceed actual price.');
});

test('zero and equal prices have zero discount', () => {
  for (const price of ['0', '100']) {
    expect(buildPriceUpdate({id: 2}, 7, price, price)).toMatchObject({
      discount_amount: '0.00', discount_percentage: '0.00',
    });
  }
});
