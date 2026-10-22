const text = value => String(value ?? '').trim();

// Match the order number AND card details. A number alone may be reused.
export const getHistoryCardKey = order => {
  if (!text(order.order_id)) return null;
  return JSON.stringify([
    order.order_id,
    order.order_date_time,
    order.order_time,
    order.order_status,
    order.delivery_address,
    order.total_amount,
  ].map(text));
};

export const uniqueHistoryOrders = orders => {
  const ids = new Set();
  const cards = new Set();
  return orders.filter(order => {
    const id = text(order.id);
    const card = getHistoryCardKey(order);
    const duplicate = (id && ids.has(id)) || (card && cards.has(card));
    if (id) ids.add(id);
    if (card) cards.add(card);
    return !duplicate;
  });
};
