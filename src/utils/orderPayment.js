// Order totals can be repeated on detail rows; use each tax component once.
const getTaxComponent = (order, items, field) => {
  const values = [order?.[field], ...items.map(item => item[field])];
  for (const value of values) {
    if (value == null || String(value).trim() === '') continue;
    const amount = Number(value);
    if (Number.isFinite(amount) && amount >= 0) return amount;
  }
  return 0;
};

export const getOrderGst = (order, items = []) => {
  const fields = [
    'total_item_gst_amount',
    'delivery_charges_gst',
    'packing_charges_gst',
    'gstonplatform_fee',
    'razorpay_gst',
  ];
  const total = fields.reduce((sum, field) => sum + getTaxComponent(order, items, field), 0);
  return Math.round(total * 100) / 100;
};
