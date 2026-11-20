// The backend already scopes orders strictly by shop_id (WHERE o.shop_id = ?),
// so that's the only check needed here. A prior version also required
// order.location_id to match the shop's current locationId, which hid
// legitimate orders whenever a shop's location was reassigned or an order's
// location_id was stale/null.
export const matchesShopLocation = (order, shop, userId) => {
  if (!shop || String(shop.id) !== String(userId)) return false;
  return String(order.shop_id) === String(shop.id);
};
