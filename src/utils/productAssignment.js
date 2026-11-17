export const isCatalogProductAssigned = (shopProducts, catalogItemId) =>
  Array.isArray(shopProducts) &&
  shopProducts.some(
    product =>
      product.item_id != null &&
      String(product.item_id) === String(catalogItemId),
  );
