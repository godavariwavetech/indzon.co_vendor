export const buildPriceUpdate = (item, shopId, actualPrice, sellingPrice) => {
  const parsePrice = value => {
    const text = String(value ?? '').trim();
    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      throw new Error('Enter valid prices with up to two decimal places.');
    }
    const number = Number(text);
    if (!Number.isFinite(number) || number < 0) {
      throw new Error('Enter valid prices.');
    }
    return number;
  };
  const actual = parsePrice(actualPrice);
  const selling = parsePrice(sellingPrice);
  if (selling > actual) {
    throw new Error('Selling price cannot exceed actual price.');
  }
  return {
    id: item.id,
    shop_id: shopId,
    actual_price: actual.toFixed(2),
    selling_price: selling.toFixed(2),
    discount_amount: (actual - selling).toFixed(2),
    discount_percentage: actual > 0 ? (((actual - selling) / actual) * 100).toFixed(2) : '0.00',
  };
};
