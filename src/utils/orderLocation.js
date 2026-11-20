// The backend already scopes orders strictly by shop_id (WHERE o.shop_id = ?),
// so that's the only check needed here. A prior version also required
// order.location_id to match the shop's current locationId, which hid
// legitimate orders whenever a shop's location was reassigned or an order's
// location_id was stale/null.
export const matchesShopLocation = (order, shop, userId) => {
  if (!shop || String(shop.id) !== String(userId)) return false;
  return String(order.shop_id) === String(shop.id);
};

// Previous version with the extra location_id/location_name check.
// Kept here in case it's needed again later.
// export const matchesShopLocation = (order, shop, userId) => {
//   if (!shop || String(shop.id) !== String(userId)) return false;
//   if (String(order.shop_id) !== String(shop.id)) return false;
//
//   if (order.location_id != null && String(order.location_id).trim() !== '' &&
//       shop.locationId != null && String(shop.locationId).trim() !== '') {
//     return String(order.location_id) === String(shop.locationId);
//   }
//
//   const normalize = value => String(value || '').trim().toLowerCase();
//   const location = normalize(shop.location);
//   return Boolean(location) && normalize(order.location_name) === location;
// };
