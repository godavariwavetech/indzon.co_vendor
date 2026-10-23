const asCents = value => {
    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value))) {
        throw new Error('Invalid commission or order amount.');
    }
    const [whole, decimal = ''] = String(value).split('.');
    const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
    if (!Number.isSafeInteger(cents)) throw new Error('Amount is too large.');
    return cents;
};

// The configured commission is deducted from the vendor's order earnings.
// Numeric database type codes must be mapped explicitly by the caller.
const calculateVendorCommission = ({type, value, orderAmount}) => {
    const baseCents = asCents(orderAmount);
    const valueHundredths = asCents(value);
    let vendorCents;
    if (type === 'percentage') {
        if (valueHundredths > 10000) throw new Error('Percentage must be between 0 and 100.');
        const product = baseCents * valueHundredths;
        if (!Number.isSafeInteger(product)) throw new Error('Amount is too large.');
        vendorCents = Math.round(product / 10000);
    } else if (type === 'amount') {
        vendorCents = valueHundredths;
        if (vendorCents > baseCents) throw new Error('Fixed commission exceeds the order amount.');
    } else {
        throw new Error('Unknown commission type.');
    }
    return {orderAmount: baseCents / 100, commissionAmount: vendorCents / 100, vendorAmount: (baseCents - vendorCents) / 100};
};

module.exports = {calculateVendorCommission};
