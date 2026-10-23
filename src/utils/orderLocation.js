export const matchesShopLocation = (order, shop, userId) => {
  if (!shop || String(shop.id) !== String(userId)) return false;
  if (String(order.shop_id) !== String(shop.id)) return false;

  if (order.location_id != null && String(order.location_id).trim() !== '' &&
      shop.locationId != null && String(shop.locationId).trim() !== '') {
    return String(order.location_id) === String(shop.locationId);
  }

  const normalize = value => String(value || '').trim().toLowerCase();
  const location = normalize(shop.location);
  return Boolean(location) && normalize(order.location_name) === location;
};
