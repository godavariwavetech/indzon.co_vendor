export const calculateEarnings = (payments, shop) => {
  if (!payments) return {commission: 0, earnings: 0};
  const sameShop = shop && String(shop.id) === String(payments.id);
  const type = payments.commission_type ?? (sameShop ? shop.commissionType : null);
  const configured = payments.admin_percentage ?? (sameShop ? shop.commission : null);
  const amount = Number(payments.item_amount ?? 0);
  let commission;
  if (configured != null && String(configured).trim() !== '' && Number.isFinite(Number(configured))) {
    const value = Number(configured);
    if (value < 0) return null;
    if (String(type) === '0') {
      if (value > 100) return null;
      commission = Math.round(amount * value) / 100;
    } else if (String(type) === '1') {
      commission = Math.round(value * Number(payments.total_orders ?? 0) * 100) / 100;
    }
  }
  // Until the profile arrives, do not display an unverified full payout.
  if (commission == null) return null;
  const earnings = amount + Number(payments.item_amount_gst ?? 0) - commission +
    Number(payments.admin_coupon_amount ?? 0) - Number(payments.vendor_coupon_amount ?? 0);
  if (!Number.isFinite(earnings) || commission > amount) return null;
  return {commission, earnings: Math.round(earnings * 100) / 100};
};
