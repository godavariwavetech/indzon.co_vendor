import {matchesShopLocation} from '../src/utils/orderLocation';

const shop = {id: 4, locationId: 1, location: 'rajahmundry'};
const order = {shop_id: '4', location_name: 'rajahmundry'};

test('keeps matching orders and excludes the live cross-city example', () => {
  expect(matchesShopLocation(order, shop, 4)).toBe(true);
  expect(matchesShopLocation({...order, location_name: 'Visakhapatnam (test)'}, shop, 4)).toBe(false);
  expect(matchesShopLocation({...order, location_name: ' Rajahmundry '}, shop, 4)).toBe(true);
});

test('uses location IDs when available', () => {
  expect(matchesShopLocation({...order, location_id: '1'}, shop, 4)).toBe(true);
  expect(matchesShopLocation({...order, location_id: '2'}, shop, 4)).toBe(false);
});

test('hides unknown locations and stale or different vendor data', () => {
  expect(matchesShopLocation({...order, location_name: ''}, shop, 4)).toBe(false);
  expect(matchesShopLocation(order, null, 4)).toBe(false);
  expect(matchesShopLocation(order, shop, 12)).toBe(false);
  expect(matchesShopLocation({...order, shop_id: 12}, shop, 4)).toBe(false);
});
