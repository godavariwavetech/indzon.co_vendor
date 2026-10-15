const image = require('../assets/ItemLogo.png');
const date = new Date();
export const today = `${date.getFullYear()}-${String(
  date.getMonth() + 1,
).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const categories = [
  'Rice & Biryani',
  'Curries',
  'Breads',
  'Beverages',
].map((name, i) => ({id: i + 1, name, shop_items_tb_nm: 'demo_products'}));
export const customers = [
  'Ananya Rao',
  'Rahul Sharma',
  'Priya Nair',
  'Arjun Kumar',
].map((name, i) => ({
  id: i + 1,
  name,
  mobile: `900000000${i}`,
  address: `${12 + i}, ${
    ['Lake View Road', 'Gandhi Nagar', 'Park Street', 'MG Road'][i]
  }, Bengaluru 560001`,
}));
export const products = [
  [
    'Hyderabadi Vegetable Biryani',
    180,
    1,
    45,
    'Fragrant basmati rice with seasonal vegetables and raita.',
  ],
  [
    'Chicken Dum Biryani',
    240,
    1,
    35,
    'Slow cooked chicken and aromatic basmati rice.',
  ],
  ['Paneer Butter Masala', 210, 2, 28, 'Soft paneer in a creamy tomato gravy.'],
  ['Dal Tadka', 140, 2, 32, 'Yellow lentils tempered with cumin and garlic.'],
  ['Butter Naan', 45, 3, 90, 'Tandoor baked flatbread brushed with butter.'],
  ['Chapati', 25, 3, 100, 'Fresh whole wheat flatbread.'],
  ['Mango Lassi', 85, 4, 40, 'Chilled yoghurt blended with ripe mango.'],
  ['Fresh Lime Soda', 60, 4, 50, 'Refreshing lime soda, lightly sweetened.'],
].map(([name, price, category, stock, description], i) => ({
  id: i + 1,
  item_name: name,
  selling_price: price,
  actual_price: price,
  sub_category_id: category,
  sub_category_name: categories[category - 1].name,
  stock,
  description,
  active_status: '0',
  filter_one: i === 1 ? 'Non Veg' : 'Veg',
  item_image: image,
}));
export const vendor = {
  id: 101,
  name: 'Indzon.co Kitchen',
  address: '24, Indiranagar, Bengaluru 560038',
  timing: '09:00 AM - 10:30 PM',
  mobile: '9000000101',
  email: 'kitchen@example.com',
  image: require('../assets/Logoindzon.png'),
  shop_active_status: 0,
};
export const orders = [0, 0, 0, 1, 1, 8, 3, 3, 3, 4, 5].map((status, i) => {
  const customer = customers[i % customers.length];
  const items = [
    products[i % products.length],
    products[(i + 4) % products.length],
  ].map((p, j) => ({
    product_id: p.id,
    name: p.item_name,
    image: p.item_image,
    price: p.selling_price,
    quantity: j + 1,
    filter_one: p.filter_one,
    isVeg: p.filter_one === 'Veg',
  }));
  const subtotal = items.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + gst + 30).toFixed(2));
  items.forEach(p =>
    Object.assign(p, {
      item_count: 3,
      item_total_amount: p.price * p.quantity,
      total_item_gst_amount: gst,
      coupon_amount: 0,
    }),
  );
  return {
    id: 1001 + i,
    order_id: `AM${1001 + i}`,
    order_status: status,
    order_date: today,
    order_date_time: `${today}T10:${String(i * 5).padStart(2, '0')}:00`,
    order_time: `10:${String(i * 5).padStart(2, '0')} AM`,
    customer,
    delivery_address: customer.address,
    grand_total: total,
    total_amount: total,
    item_amount: subtotal,
    total_item_gst_amount: gst,
    delivery_charges: 30,
    item_count: 3,
    coupon_amount: 0,
    total_saving_amount: 0,
    payment_type: i % 2 ? 'Cash' : 'UPI',
    payment_status: status === 3 || i % 2 === 0 ? 'Paid' : 'Pending',
    order_instructions: 'Please pack securely. Include cutlery.',
    items,
    delivery_boy_array: JSON.stringify([
      {delivery_boy_name: 'Kiran', delivery_boy_mobile_number: '9000000201'},
    ]),
  };
});
export const notifications = [
  {
    id: 1,
    title: 'New order received',
    body: 'Three incoming orders are ready for review.',
    read: false,
  },
  {
    id: 2,
    title: 'Settlement completed',
    body: 'Your latest settlement has been credited.',
    read: false,
  },
  {
    id: 3,
    title: 'Inventory reminder',
    body: 'Review stock before the evening service.',
    read: true,
  },
];
export const transactions = orders
  .filter(o => o.order_status === 3)
  .map(o => ({
    id: o.id,
    order_id: o.id,
    total_payment_amount: Number(
      (o.item_amount + o.total_item_gst_amount - o.item_amount * 0.05).toFixed(
        2,
      ),
    ),
    payment_method: 'Bank Transfer',
    payment_dates: today,
    payment_transaction_id: `IZ-TXN-${o.id}`,
    status: 'Completed',
    settlement_date_time: `${today} 12:30 PM`,
  }));
export const common = {
  mail_id: 'support@example.com',
  contact_number: '9000000301',
  whatsapp_number: '9000000301',
};
